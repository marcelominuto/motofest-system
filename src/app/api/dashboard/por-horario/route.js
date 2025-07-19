import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/dashboard/por-horario
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

    const dados = await prisma.agendamento.groupBy({
      by: ["horarioId"],
      where: {
        eventoId: eventoAtivo.id,
      },
      _count: true,
    });

    const resposta = await Promise.all(
      dados.map(async (item) => {
        const horario = await prisma.horario.findUnique({
          where: { id: item.horarioId },
        });

        return {
          horario: horario?.hora || "Desconhecido",
          quantidade: item._count,
        };
      })
    );

    return NextResponse.json(resposta);
  } catch (error) {
    console.error("Erro ao agrupar agendamentos por horário:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados" },
      { status: 500 }
    );
  }
}
