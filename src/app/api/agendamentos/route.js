import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

// GET: List all bookings
export async function GET() {
  try {
    const agendamentos = await prisma.agendamento.findMany({
      include: {
        cliente: true,
        ingresso: true,
        moto: { include: { marca: true } },
        horario: true,
        evento: true,
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json(agendamentos);
  } catch (error) {
    console.error("GET /agendamentos error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

// POST: Create a new booking
export async function POST(req) {
  try {
    const { clienteId, ingressoId, motoId, data, horarioId, eventoId } =
      await req.json();

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

    // Verifica a quantidade de agendamentos para essa moto nesse horário
    const totalAgendamentos = await prisma.agendamento.count({
      where: { motoId, horarioId, data: new Date(data) },
    });

    const moto = await prisma.moto.findUnique({ where: { id: motoId } });

    if (!moto) {
      return NextResponse.json({ error: "Moto not found" }, { status: 404 });
    }

    if (totalAgendamentos >= moto.quantidade) {
      return NextResponse.json(
        { error: "No more slots available for this motorcycle at this time" },
        { status: 409 }
      );
    }

    const agendamento = await prisma.agendamento.create({
      data: {
        clienteId,
        ingressoId,
        motoId,
        data: new Date(data),
        horarioId,
        eventoId,
        codigo: uuidv4(),
      },
    });

    return NextResponse.json(agendamento);
  } catch (error) {
    console.error("POST /agendamentos error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
