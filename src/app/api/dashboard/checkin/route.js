import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/dashboard/checkin
export async function GET() {
  try {
    const eventoAtivo = await prisma.evento.findFirst({
      where: { ativo: true },
    });

    if (!eventoAtivo) {
      return NextResponse.json(
        { error: "Nenhum evento ativo encontrado" },
        { status: 404 }
      );
    }

    const total = await prisma.agendamento.count({
      where: {
        checkin: true,
        eventoId: eventoAtivo.id,
      },
    });

    return NextResponse.json({ total });
  } catch (error) {
    console.error("Erro ao contar check-ins:", error);
    return NextResponse.json(
      { error: "Erro ao buscar total de check-ins" },
      { status: 500 }
    );
  }
}
