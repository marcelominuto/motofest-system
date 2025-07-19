import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getEventoAtivo } from "@/lib/getEventoAtivo";

// GET: Verificar disponibilidade de motos
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const motoId = searchParams.get("motoId");
    const data = searchParams.get("data");
    const horarioId = searchParams.get("horarioId");

    if (!motoId || !data || !horarioId) {
      return NextResponse.json(
        { error: "Parâmetros obrigatórios: motoId, data, horarioId" },
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

    // Conta agendamentos existentes
    const totalAgendamentos = await prisma.agendamento.count({
      where: {
        motoId: parseInt(motoId, 10),
        horarioId: parseInt(horarioId, 10),
        data: new Date(data),
        eventoId: evento.id,
      },
    });

    const disponivel = moto.quantidade - totalAgendamentos;

    return NextResponse.json({
      moto: {
        id: moto.id,
        nome: moto.nome,
        marca: moto.marca.nome,
        quantidade: moto.quantidade,
      },
      data: new Date(data).toISOString(),
      horarioId: parseInt(horarioId, 10),
      totalAgendamentos,
      disponivel,
      esgotado: disponivel <= 0,
    });
  } catch (error) {
    console.error("Erro ao verificar disponibilidade:", error);
    return NextResponse.json(
      { error: "Erro interno ao verificar disponibilidade" },
      { status: 500 }
    );
  }
}
