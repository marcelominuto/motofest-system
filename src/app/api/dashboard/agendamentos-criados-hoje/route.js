import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const agendamentos = await prisma.agendamento.count({
      where: {
        createdAt: {
          gte: hoje,
          lt: new Date(hoje.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    return NextResponse.json({ total: agendamentos });
  } catch (error) {
    console.error("Erro ao buscar agendamentos criados hoje:", error);
    return NextResponse.json({ total: 0 });
  }
}
