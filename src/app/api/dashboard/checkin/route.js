import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/dashboard/checkin
export async function GET() {
  try {
    const total = await prisma.agendamento.count({
      where: { checkin: true },
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
