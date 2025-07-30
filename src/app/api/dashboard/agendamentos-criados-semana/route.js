import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const hoje = new Date();
    const umaSemanaAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);

    const agendamentos = await prisma.agendamento.count({
      where: {
        createdAt: {
          gte: umaSemanaAtras,
          lte: hoje,
        },
      },
    });

    return NextResponse.json({ total: agendamentos });
  } catch (error) {
    console.error("Erro ao buscar agendamentos criados na semana:", error);
    return NextResponse.json({ total: 0 });
  }
}
