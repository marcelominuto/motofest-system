import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/dashboard/por-dia
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
      by: ["data"],
      where: {
        eventoId: eventoAtivo.id,
      },
      _count: true,
      orderBy: {
        data: "asc",
      },
    });

    const resposta = dados.map((item) => ({
      data: item.data.toISOString().split("T")[0],
      quantidade: item._count,
    }));

    return NextResponse.json(resposta);
  } catch (error) {
    console.error("Erro ao agrupar agendamentos por dia:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados" },
      { status: 500 }
    );
  }
}
