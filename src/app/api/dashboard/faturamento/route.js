import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/dashboard/faturamento
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

    const resultado = await prisma.pedido.aggregate({
      _sum: {
        valor: true,
      },
      where: {
        status: "pago",
        eventoId: eventoAtivo.id,
      },
    });

    const total = resultado._sum.valor || 0;
    return NextResponse.json({ total });
  } catch (error) {
    console.error("Erro ao calcular faturamento:", error);
    return NextResponse.json(
      { error: "Erro ao calcular faturamento" },
      { status: 500 }
    );
  }
}
