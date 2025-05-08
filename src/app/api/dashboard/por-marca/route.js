import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/dashboard/por-marca
export async function GET() {
  try {
    const dados = await prisma.agendamento.groupBy({
      by: ["motoId"],
      _count: true,
    });

    const resultados = await Promise.all(
      dados.map(async (item) => {
        const moto = await prisma.moto.findUnique({
          where: { id: item.motoId },
          include: { marca: true },
        });

        return {
          marca: moto?.marca?.nome || "Desconhecida",
          quantidade: item._count,
        };
      })
    );

    // Agrupar por marca somando tudo
    const marcas = {};
    for (const r of resultados) {
      marcas[r.marca] = (marcas[r.marca] || 0) + r.quantidade;
    }

    const resposta = Object.entries(marcas).map(([marca, quantidade]) => ({
      marca,
      quantidade,
    }));

    return NextResponse.json(resposta);
  } catch (error) {
    console.error("Erro ao agrupar agendamentos por marca:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados" },
      { status: 500 }
    );
  }
}
