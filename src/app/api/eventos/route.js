import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/eventos
export async function GET() {
  try {
    const eventos = await prisma.evento.findMany({
      orderBy: { dataInicio: "desc" },
    });
    return NextResponse.json(eventos);
  } catch (error) {
    console.error("Erro ao buscar eventos:", error);
    return NextResponse.json(
      { erro: "Erro ao buscar eventos", detalhes: error.message },
      { status: 500 }
    );
  }
}

// POST /api/eventos
export async function POST(request) {
  const body = await request.json();
  const { nome, dataInicio, dataFim, ativo } = body;

  if (!nome || !dataInicio || !dataFim) {
    return NextResponse.json(
      { erro: "Campos obrigatórios: nome, dataInicio, dataFim" },
      { status: 400 }
    );
  }

  try {
    const novoEvento = await prisma.evento.create({
      data: {
        nome,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        ativo: ativo || false,
      },
    });

    return NextResponse.json(novoEvento, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { erro: "Erro ao criar evento", detalhes: error.message },
      { status: 500 }
    );
  }
}
