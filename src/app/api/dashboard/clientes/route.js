import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/dashboard/clientes
export async function GET() {
  try {
    const total = await prisma.cliente.count();
    return NextResponse.json({ total });
  } catch (error) {
    console.error("Erro ao contar clientes:", error);
    return NextResponse.json(
      { error: "Erro ao buscar total de clientes" },
      { status: 500 }
    );
  }
}
