import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/dashboard/pedidos
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

    const total = await prisma.pedido.count({
      where: {
        eventoId: eventoAtivo.id,
        status: "pago", // Apenas pedidos pagos
      },
    });

    return NextResponse.json({ total });
  } catch (error) {
    console.error("Erro ao contar pedidos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar total de pedidos" },
      { status: 500 }
    );
  }
}
