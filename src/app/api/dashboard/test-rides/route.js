import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/dashboard/test-rides
export async function GET() {
  try {
    const total = await prisma.agendamento.count({
      where: {
        status: {
          in: ["pago", "cortesia"],
        },
      },
    });

    return NextResponse.json({ total });
  } catch (error) {
    console.error("Erro ao contar test rides:", error);
    return NextResponse.json(
      { error: "Erro ao buscar total de test rides" },
      { status: 500 }
    );
  }
}
