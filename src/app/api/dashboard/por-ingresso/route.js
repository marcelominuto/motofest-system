import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/dashboard/por-ingresso
export async function GET() {
  try {
    const eventoAtivo = await prisma.evento.findFirst({
      where: { ativo: true },
    });

    if (!eventoAtivo) {
      return NextResponse.json([]);
    }

    const dados = await prisma.agendamento.groupBy({
      by: ["motoId"],
      where: {
        eventoId: eventoAtivo.id,
      },
      _count: true,
    });

    const resultados = await Promise.all(
      dados.map(async (item) => {
        const moto = await prisma.moto.findUnique({
          where: { id: item.motoId },
          include: { ingresso: true },
        });

        return {
          tipo: moto?.ingresso?.tipo || "Sem tipo",
          quantidade: item._count,
        };
      })
    );

    // Agrupar por tipo de ingresso somando
    const tiposIngresso = {};
    for (const r of resultados) {
      tiposIngresso[r.tipo] = (tiposIngresso[r.tipo] || 0) + r.quantidade;
    }

    const resposta = Object.entries(tiposIngresso).map(
      ([tipo, quantidade]) => ({
        tipo,
        quantidade,
      })
    );

    return NextResponse.json(resposta);
  } catch (error) {
    console.error("Erro ao agrupar agendamentos por tipo de ingresso:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados" },
      { status: 500 }
    );
  }
}
