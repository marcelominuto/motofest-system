import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const horariosPopulares = await prisma.agendamento.groupBy({
      by: ["horarioId"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 5,
    });

    // Buscar dados dos horários separadamente
    const resultado = await Promise.all(
      horariosPopulares.map(async (item) => {
        const horario = await prisma.horario.findUnique({
          where: { id: item.horarioId },
          select: { hora: true },
        });

        return {
          horario: horario?.hora || "Horário não encontrado",
          quantidade: item._count.id,
        };
      })
    );

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Erro ao buscar horários populares:", error);
    return NextResponse.json([]);
  }
}
