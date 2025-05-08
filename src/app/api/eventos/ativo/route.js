import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/eventos/ativo
export async function GET() {
  try {
    const eventoAtivo = await prisma.evento.findFirst({
      where: { ativo: true },
      orderBy: { dataInicio: "desc" },
    });

    if (!eventoAtivo) {
      return NextResponse.json(
        { error: "Nenhum evento ativo encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(eventoAtivo);
  } catch (error) {
    console.error("Erro ao buscar evento ativo:", error);
    return NextResponse.json(
      { error: "Erro interno", detalhes: error.message },
      { status: 500 }
    );
  }
}
