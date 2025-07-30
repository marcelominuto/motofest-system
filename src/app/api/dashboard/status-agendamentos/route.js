import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const statusAgendamentos = await prisma.agendamento.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    const resultado = statusAgendamentos.map((item) => ({
      name:
        item.status === "pago"
          ? "Confirmados"
          : item.status === "pendente"
            ? "Pendentes"
            : item.status === "cancelado"
              ? "Cancelados"
              : "Outros",
      value: item._count.id,
    }));

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Erro ao buscar status dos agendamentos:", error);
    return NextResponse.json([]);
  }
}
