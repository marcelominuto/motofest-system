import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getEventoAtivo } from "@/lib/getEventoAtivo";

// PUT: Update brand by ID
export async function PUT(req, { params }) {
  const { id } = await params;
  const { nome } = await req.json();

  if (!nome) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  try {
    const evento = await getEventoAtivo();
    if (!evento) {
      return NextResponse.json(
        { error: "Nenhum evento ativo encontrado." },
        { status: 404 }
      );
    }

    const updated = await prisma.marca.update({
      where: { id: parseInt(id) },
      data: { nome },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /marcas/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update brand" },
      { status: 500 }
    );
  }
}

// DELETE: Delete brand by ID
export async function DELETE(_req, { params }) {
  const { id } = await params;

  try {
    const evento = await getEventoAtivo();
    if (!evento) {
      return NextResponse.json(
        { error: "Nenhum evento ativo encontrado." },
        { status: 404 }
      );
    }

    await prisma.marca.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /marcas/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete brand" },
      { status: 500 }
    );
  }
}
