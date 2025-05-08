import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PUT: Update a booking by ID
export async function PUT(req, { params }) {
  const { id } = params;
  const {
    clienteId,
    ingressoId,
    motoId,
    data,
    horarioId,
    eventoId,
    status,
    checkin,
  } = await req.json();

  if (
    !clienteId ||
    !ingressoId ||
    !motoId ||
    !data ||
    !horarioId ||
    !eventoId
  ) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  try {
    // Verifica duplicidade de agendamento do mesmo cliente
    const conflito = await prisma.agendamento.findFirst({
      where: {
        clienteId,
        data: new Date(data),
        horarioId,
        id: { not: parseInt(id) }, // ignora o atual
      },
    });

    if (conflito) {
      return NextResponse.json(
        { error: "Client already has an appointment at this time" },
        { status: 409 }
      );
    }

    // Verifica limite de motos para esse horário
    const totalAgendamentos = await prisma.agendamento.count({
      where: {
        motoId,
        horarioId,
        data: new Date(data),
        id: { not: parseInt(id) },
      },
    });

    const moto = await prisma.moto.findUnique({ where: { id: motoId } });

    if (!moto) {
      return NextResponse.json(
        { error: "Motorcycle not found" },
        { status: 404 }
      );
    }

    if (totalAgendamentos >= moto.quantidade) {
      return NextResponse.json(
        { error: "No more slots available for this motorcycle at this time" },
        { status: 409 }
      );
    }

    const updated = await prisma.agendamento.update({
      where: { id: parseInt(id) },
      data: {
        clienteId,
        ingressoId,
        motoId,
        data: new Date(data),
        horarioId,
        eventoId,
        status,
        checkin,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /agendamentos/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a booking
export async function DELETE(_req, { params }) {
  const { id } = params;

  try {
    await prisma.agendamento.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /agendamentos/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
