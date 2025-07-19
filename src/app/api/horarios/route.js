import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getEventoAtivo } from "@/lib/getEventoAtivo";

// GET /api/horarios
export async function GET() {
  try {
    const evento = await getEventoAtivo();
    if (!evento) {
      return NextResponse.json(
        { error: "Evento ativo não encontrado" },
        { status: 404 }
      );
    }

    const horarios = await prisma.horario.findMany({
      where: { eventoId: evento.id },
      orderBy: { hora: "asc" },
    });

    return NextResponse.json(horarios);
  } catch (error) {
    console.error("Erro ao buscar horários:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const evento = await getEventoAtivo();
    if (!evento) {
      return NextResponse.json(
        { error: "Evento ativo não encontrado" },
        { status: 404 }
      );
    }

    const { hora } = await req.json();

    if (!hora) {
      return NextResponse.json(
        { error: "Campo 'hora' é obrigatório" },
        { status: 400 }
      );
    }

    const existente = await prisma.horario.findFirst({
      where: {
        hora,
        eventoId: evento.id,
      },
    });

    if (existente) {
      return NextResponse.json(
        { error: "Horário já cadastrado para este evento" },
        { status: 409 }
      );
    }

    const novo = await prisma.horario.create({
      data: {
        hora,
        eventoId: evento.id,
      },
    });

    return NextResponse.json(novo);
  } catch (error) {
    console.error("Erro ao criar horário:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
