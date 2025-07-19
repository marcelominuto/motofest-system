import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getEventoAtivo } from "@/lib/getEventoAtivo";

// GET: Buscar horários indisponíveis para uma moto em uma data
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const motoId = searchParams.get("motoId");
    const data = searchParams.get("data");

    if (!motoId || !data) {
      return NextResponse.json(
        { error: "Parâmetros obrigatórios: motoId, data" },
        { status: 400 }
      );
    }

    const evento = await getEventoAtivo();
    if (!evento) {
      return NextResponse.json(
        { error: "Nenhum evento ativo encontrado" },
        { status: 404 }
      );
    }

    // Busca a moto
    const moto = await prisma.moto.findUnique({
      where: { id: parseInt(motoId, 10) },
      include: { marca: true },
    });

    if (!moto) {
      return NextResponse.json(
        { error: "Moto não encontrada" },
        { status: 404 }
      );
    }

    // Busca todos os agendamentos para esta moto nesta data
    const agendamentos = await prisma.agendamento.findMany({
      where: {
        motoId: parseInt(motoId, 10),
        data: new Date(data),
        eventoId: evento.id,
      },
      include: {
        horario: true,
      },
    });

    // Agrupa por horário e conta quantos agendamentos existem
    const agendamentosPorHorario = {};
    agendamentos.forEach((agendamento) => {
      const horarioId = agendamento.horarioId;
      if (!agendamentosPorHorario[horarioId]) {
        agendamentosPorHorario[horarioId] = {
          horario: agendamento.horario,
          quantidade: 0,
        };
      }
      agendamentosPorHorario[horarioId].quantidade++;
    });

    // Identifica horários indisponíveis (quantidade >= quantidade da moto)
    const horariosIndisponiveis = Object.entries(agendamentosPorHorario)
      .filter(([_, info]) => info.quantidade >= moto.quantidade)
      .map(([horarioId, info]) => ({
        horarioId: parseInt(horarioId),
        horario: info.horario,
        quantidade: info.quantidade,
        disponivel: moto.quantidade - info.quantidade,
        esgotado: true,
      }));

    return NextResponse.json({
      moto: {
        id: moto.id,
        nome: moto.nome,
        marca: moto.marca.nome,
        quantidade: moto.quantidade,
      },
      data: new Date(data).toISOString(),
      horariosIndisponiveis,
    });
  } catch (error) {
    console.error("Erro ao buscar horários indisponíveis:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar horários indisponíveis" },
      { status: 500 }
    );
  }
}
