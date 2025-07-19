import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { getEventoAtivo } from "@/lib/getEventoAtivo";

// GET: Listar todos os agendamentos do evento ativo
export async function GET() {
  try {
    const evento = await getEventoAtivo();
    if (!evento) {
      return NextResponse.json(
        { error: "Nenhum evento ativo encontrado" },
        { status: 404 }
      );
    }

    const agendamentos = await prisma.agendamento.findMany({
      where: { eventoId: evento.id },
      include: {
        cliente: true,
        ingresso: true,
        moto: { include: { marca: true } },
        horario: true,
        pedido: true, // incluir o pedido para exibir o código
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json(agendamentos);
  } catch (error) {
    console.error("GET /api/agendamentos error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar agendamentos" },
      { status: 500 }
    );
  }
}

// POST: Create multiple bookings (1 por moto)
export async function POST(req) {
  try {
    const evento = await getEventoAtivo();
    if (!evento) {
      return NextResponse.json(
        { error: "Nenhum evento ativo encontrado" },
        { status: 404 }
      );
    }

    const { clienteId, ingressoId, agendamentos, cortesia } = await req.json();

    if (
      !clienteId ||
      !ingressoId ||
      !Array.isArray(agendamentos) ||
      agendamentos.length === 0
    ) {
      return NextResponse.json(
        { error: "Dados incompletos para agendamento" },
        { status: 400 }
      );
    }

    // 1. Validação de conflitos do cliente (mesmo horário/data)
    const conflitos = await Promise.all(
      agendamentos.map((a) =>
        prisma.agendamento.findFirst({
          where: {
            clienteId,
            data: new Date(a.data),
            horarioId: parseInt(a.horarioId, 10),
            eventoId: evento.id,
          },
        })
      )
    );

    if (conflitos.some(Boolean)) {
      return NextResponse.json(
        { error: "O cliente já possui agendamento neste horário e data" },
        { status: 409 }
      );
    }

    // 2. Verifica disponibilidade das motos
    for (const { motoId, horarioId, data } of agendamentos) {
      const total = await prisma.agendamento.count({
        where: {
          motoId: parseInt(motoId, 10),
          horarioId: parseInt(horarioId, 10),
          data: new Date(data),
          eventoId: evento.id,
        },
      });

      const moto = await prisma.moto.findUnique({
        where: { id: parseInt(motoId, 10) },
      });
      if (!moto) {
        return NextResponse.json(
          { error: `Moto ${motoId} não encontrada` },
          { status: 404 }
        );
      }

      if (total >= moto.quantidade) {
        return NextResponse.json(
          {
            error: `Limite de agendamentos excedido para a moto ${moto.nome} no horário selecionado`,
          },
          { status: 409 }
        );
      }
    }

    // 3. Verifica e consome a cortesia (opcional)
    if (cortesia) {
      const cortesiaEncontrada = await prisma.cortesia.findUnique({
        where: { codigo: cortesia },
      });

      if (
        !cortesiaEncontrada ||
        cortesiaEncontrada.utilizado ||
        cortesiaEncontrada.eventoId !== evento.id
      ) {
        return NextResponse.json(
          { error: "Cortesia inválida ou já utilizada" },
          { status: 400 }
        );
      }

      await prisma.cortesia.update({
        where: { codigo: cortesia },
        data: { utilizado: true },
      });
    }

    // 4. Cria agendamentos em lote
    const novosAgendamentos = agendamentos.map(
      ({ motoId, data, horarioId, checkin }) => ({
        clienteId,
        ingressoId: parseInt(ingressoId, 10),
        motoId: parseInt(motoId, 10),
        data: new Date(data),
        horarioId: parseInt(horarioId, 10),
        eventoId: evento.id,
        status: cortesia ? "cortesia" : "pago",
        checkin: typeof checkin === "boolean" ? checkin : false,
        codigo: uuidv4(),
      })
    );

    const criados = await prisma.$transaction(
      novosAgendamentos.map((a) => prisma.agendamento.create({ data: a }))
    );

    return NextResponse.json({ sucesso: true, criados });
  } catch (error) {
    console.error("Erro no POST /api/agendamentos:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar agendamentos" },
      { status: 500 }
    );
  }
}
