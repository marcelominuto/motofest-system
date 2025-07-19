import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PUT: update client
export async function PUT(req, { params }) {
  const { id } = await params;
  const { nome, email, cpf, cnh, telefone } = await req.json();

  if (!nome || !cpf) {
    return NextResponse.json(
      { error: "Name and CPF are required" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.cliente.update({
      where: { id: parseInt(id) },
      data: { nome, email, cpf, cnh, telefone },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /clientes/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update client" },
      { status: 500 }
    );
  }
}

// DELETE: remove client
export async function DELETE(_req, { params }) {
  const { id } = await params;

  try {
    await prisma.cliente.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /clientes/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    );
  }
}
