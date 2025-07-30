import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Buscar evento ativo
    const eventoAtivo = await prisma.evento.findFirst({
      where: { ativo: true },
    });

    if (!eventoAtivo) {
      return NextResponse.json({ total: 0 });
    }

    // Contar todas as mobilidades (sem filtro por evento por enquanto)
    const mobilidades = await prisma.mobilidade.count();

    return NextResponse.json({ total: mobilidades });
  } catch (error) {
    console.error("Erro ao buscar registros de mobilidade:", error);
    return NextResponse.json({ total: 0 });
  }
}
