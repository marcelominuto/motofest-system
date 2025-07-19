// DELETE /api/horarios/[id]
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(_req, { params }) {
  const { id } = await params;

  try {
    await prisma.horario.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir horário:", error);

    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Horário vinculado a agendamentos, não pode ser excluído." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao excluir horário." },
      { status: 500 }
    );
  }
}
