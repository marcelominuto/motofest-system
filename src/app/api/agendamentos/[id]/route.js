import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getEventoAtivo } from "@/lib/getEventoAtivo";

// PUT /api/agendamentos/[id]
export async function PUT(req, context) {
  const params = await context.params;
  const { id } = await params;
  const { clienteId, ingressoId, motoId, data, horarioId, status, checkin } =
    await req.json();

  const evento = await getEventoAtivo();
  if (!evento) {
    return NextResponse.json(
      { error: "Nenhum evento ativo encontrado" },
      { status: 404 }
    );
  }

  if (!clienteId || !ingressoId || !motoId || !data || !horarioId) {
    return NextResponse.json(
      { error: "Todos os campos obrigatórios devem ser preenchidos" },
      { status: 400 }
    );
  }

  try {
    // Verifica se o cliente já tem agendamento neste horário e data
    const conflito = await prisma.agendamento.findFirst({
      where: {
        clienteId,
        data: new Date(data),
        horarioId: parseInt(horarioId, 10),
        eventoId: evento.id,
        id: { not: parseInt(id) }, // Ignora o próprio agendamento
      },
    });

    if (conflito) {
      return NextResponse.json(
        { error: "Este cliente já possui um agendamento neste horário e data" },
        { status: 409 }
      );
    }

    // Verifica disponibilidade da moto nesse horário
    const totalAgendamentos = await prisma.agendamento.count({
      where: {
        motoId,
        horarioId: parseInt(horarioId, 10),
        data: new Date(data),
        eventoId: evento.id,
        id: { not: parseInt(id) }, // Ignora o próprio agendamento
      },
    });

    const moto = await prisma.moto.findUnique({
      where: { id: motoId },
    });

    if (!moto) {
      return NextResponse.json(
        { error: "Moto não encontrada" },
        { status: 404 }
      );
    }

    if (totalAgendamentos >= moto.quantidade) {
      return NextResponse.json(
        {
          error: "Não há mais vagas disponíveis para esta moto neste horário",
        },
        { status: 409 }
      );
    }

    // Atualiza agendamento
    const updated = await prisma.agendamento.update({
      where: { id: parseInt(id) },
      data: {
        clienteId,
        ingressoId,
        motoId,
        data: new Date(data),
        horarioId: parseInt(horarioId, 10),
        eventoId: evento.id,
        status,
        checkin,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /agendamentos/[id] error:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar agendamento" },
      { status: 500 }
    );
  }
}

// DELETE /api/agendamentos/[id]
export async function DELETE(_req, context) {
  const params = await context.params;
  const { id } = await params;

  try {
    await prisma.agendamento.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /agendamentos/[id] error:", error);
    return NextResponse.json(
      { error: "Erro ao excluir agendamento" },
      { status: 500 }
    );
  }
}
