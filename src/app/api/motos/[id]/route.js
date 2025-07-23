import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PUT: Update motorcycle by ID
export async function PUT(req, { params }) {
  const { id } = await params;
  const {
    nome,
    marcaId,
    quantidade,
    categoria,
    ingressoId,
    foto,
    cvs,
    cilindradas,
  } = await req.json();

  if (!nome || !marcaId || !quantidade || !categoria || !ingressoId) {
    return NextResponse.json(
      {
        error:
          "Todos os campos (nome, marca, quantidade, categoria, ingresso) são obrigatórios.",
      },
      { status: 400 }
    );
  }

  try {
    // Verificar se o ingresso existe
    const ingresso = await prisma.ingresso.findUnique({
      where: { id: parseInt(ingressoId) },
    });

    if (!ingresso) {
      return NextResponse.json(
        { error: "Ingresso não encontrado." },
        { status: 404 }
      );
    }

    const updated = await prisma.moto.update({
      where: { id: parseInt(id) },
      data: {
        nome,
        marcaId: parseInt(marcaId),
        ingressoId: parseInt(ingressoId),
        quantidade: parseInt(quantidade),
        categoria,
        foto: foto || null,
        cvs: cvs || null,
        cilindradas: cilindradas || null,
      },
      include: {
        marca: true,
        ingresso: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /motos/[id] error:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar motocicleta." },
      { status: 500 }
    );
  }
}

// DELETE: Delete motorcycle by ID
export async function DELETE(_req, { params }) {
  const { id } = await params;

  try {
    await prisma.moto.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /motos/[id] error:", error);
    return NextResponse.json(
      { error: "Erro ao excluir motocicleta." },
      { status: 500 }
    );
  }
}
