import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/dashboard/pedidos
export async function GET() {
  try {
    const total = await prisma.pedido.count();
    return NextResponse.json({ total });
  } catch (error) {
    console.error("Erro ao contar pedidos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar total de pedidos" },
      { status: 500 }
    );
  }
}
