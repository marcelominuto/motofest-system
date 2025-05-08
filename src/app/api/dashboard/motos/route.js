import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/dashboard/motos
export async function GET() {
  try {
    const total = await prisma.moto.count();
    return NextResponse.json({ total });
  } catch (error) {
    console.error("Erro ao contar motos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar total de motos" },
      { status: 500 }
    );
  }
}
