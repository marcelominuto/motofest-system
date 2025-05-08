import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/dashboard/por-modelo
export async function GET() {
  try {
    const dados = await prisma.agendamento.groupBy({
      by: ["motoId"],
      _count: true,
    });

    const resposta = await Promise.all(
      dados.map(async (item) => {
        const moto = await prisma.moto.findUnique({
          where: { id: item.motoId },
        });

        return {
          modelo: moto?.nome || "Desconhecido",
          quantidade: item._count,
        };
      })
    );

    return NextResponse.json(resposta);
  } catch (error) {
    console.error("Erro ao agrupar agendamentos por modelo:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados" },
      { status: 500 }
    );
  }
}
