import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PUT /api/eventos/[id]
export async function PUT(req, context) {
  const params = await context.params;
  const id = params.id;

  const body = await req.json();
  const { nome, dataInicio, dataFim, ativo } = body;

  if (!nome || !dataInicio || !dataFim) {
    return NextResponse.json(
      { error: "Campos obrigatórios: nome, dataInicio, dataFim" },
      { status: 400 }
    );
  }

  try {
    // Se ativar este evento, desativa os outros
    if (ativo === true) {
      await prisma.evento.updateMany({
        where: { ativo: true },
        data: { ativo: false },
      });
    }

    const eventoAtualizado = await prisma.evento.update({
      where: { id: parseInt(id) },
      data: {
        nome,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        ativo: ativo ?? false,
      },
    });

    return NextResponse.json(eventoAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar evento:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar evento", detalhes: error.message },
      { status: 500 }
    );
  }
}
