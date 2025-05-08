import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PUT: Update motorcycle by ID
export async function PUT(req, { params }) {
  const { id } = params;
  const { nome, marcaId, quantidade, categoria } = await req.json();

  if (!nome || !marcaId || !quantidade || !categoria) {
    return NextResponse.json(
      { error: "All fields (name, brand ID, quantity, category) are required" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.moto.update({
      where: { id: parseInt(id) },
      data: {
        nome,
        marcaId: parseInt(marcaId),
        quantidade: parseInt(quantidade),
        categoria,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /motos/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update motorcycle" },
      { status: 500 }
    );
  }
}

// DELETE: Delete motorcycle by ID
export async function DELETE(_req, { params }) {
  const { id } = params;

  try {
    await prisma.moto.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /motos/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete motorcycle" },
      { status: 500 }
    );
  }
}
