import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const motosPopulares = await prisma.agendamento.groupBy({
      by: ["motoId"],
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

    // Buscar dados das motos separadamente
    const resultado = await Promise.all(
      motosPopulares.map(async (item) => {
        const moto = await prisma.moto.findUnique({
          where: { id: item.motoId },
          select: { nome: true },
        });

        return {
          moto: moto?.nome || "Moto não encontrada",
          quantidade: item._count.id,
        };
      })
    );

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Erro ao buscar motos populares:", error);
    return NextResponse.json([]);
  }
}
