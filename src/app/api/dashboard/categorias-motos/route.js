import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getEventoAtivo } from "@/lib/getEventoAtivo";

export async function GET() {
  try {
    const eventoAtivo = await getEventoAtivo();

    if (!eventoAtivo) {
      return NextResponse.json({ categorias: [] });
    }

    // Buscar agendamentos agrupados por categoria da moto
    const categorias = await prisma.agendamento.groupBy({
      by: ["motoId"],
      where: {
        eventoId: eventoAtivo.id,
      },
      _count: {
        id: true,
      },
    });

    // Buscar os nomes das motos e suas categorias
    const categoriasComDetalhes = await Promise.all(
      categorias.map(async (categoria) => {
        const moto = await prisma.moto.findUnique({
          where: { id: categoria.motoId },
          include: { marca: true },
        });

        return {
          categoria: moto?.categoria || "Sem categoria",
          quantidade: categoria._count.id,
          moto: moto?.nome || moto?.modelo || "Moto desconhecida",
          marca: moto?.marca?.nome || "Marca desconhecida",
        };
      })
    );

    // Agrupar por categoria
    const categoriasAgrupadas = categoriasComDetalhes.reduce((acc, item) => {
      const categoria = item.categoria;
      if (!acc[categoria]) {
        acc[categoria] = {
          categoria,
          quantidade: 0,
          motos: [],
        };
      }
      acc[categoria].quantidade += item.quantidade;
      acc[categoria].motos.push({
        nome: item.moto,
        marca: item.marca,
        quantidade: item.quantidade,
      });
      return acc;
    }, {});

    // Converter para array e ordenar por quantidade
    const resultado = Object.values(categoriasAgrupadas).sort(
      (a, b) => b.quantidade - a.quantidade
    );

    return NextResponse.json({ categorias: resultado });
  } catch (error) {
    console.error("Erro ao buscar categorias das motos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
