import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/dashboard/faturamento
export async function GET() {
  try {
    const resultado = await prisma.pedido.aggregate({
      _sum: {
        valor: true,
      },
      where: {
        status: "pago",
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
