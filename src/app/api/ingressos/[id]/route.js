import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getEventoAtivo } from "@/lib/getEventoAtivo";

// PUT /api/ingressos/[id]
export async function PUT(req, context) {
  const { id } = context.params;
  const body = await req.json();
  const {
    tipo,
    categoria,
    descricao,
    limite,
    valor,
    valor1,
    valor2,
    valor3,
    link,
  } = body;

  if (!tipo || !categoria) {
    return NextResponse.json(
      { error: "Campos obrigatórios ausentes." },
      { status: 400 }
    );
  }

  try {
    const evento = await getEventoAtivo();
    if (!evento) {
      return NextResponse.json(
        { error: "Nenhum evento ativo encontrado." },
        { status: 404 }
      );
    }

    const ingresso = await prisma.ingresso.findUnique({
      where: { id: parseInt(id) },
    });

    if (!ingresso || ingresso.eventoId !== evento.id) {
      return NextResponse.json(
        { error: "Este ingresso não pertence ao evento ativo." },
        { status: 403 }
      );
    }

    const data = {
      tipo,
      categoria,
      descricao: descricao || null,
      limite: limite ? parseInt(limite) : null,
      valor: null,
      valor1: null,
      valor2: null,
      valor3: null,
      link: null,
    };

    if (categoria === "normal") {
      if (!valor) {
        return NextResponse.json(
          { error: "Valor obrigatório para categoria normal." },
          { status: 400 }
        );
      }
      data.valor = parseFloat(valor);
      if (link) data.link = link;
    } else if (categoria === "test ride") {
      if (!valor1 || !valor2 || !valor3) {
        return NextResponse.json(
          { error: "Todos os valores são obrigatórios para test ride." },
          { status: 400 }
        );
      }
      data.valor1 = parseFloat(valor1);
      data.valor2 = parseFloat(valor2);
      data.valor3 = parseFloat(valor3);
    }

    const ingressoAtualizado = await prisma.ingresso.update({
      where: { id: parseInt(id) },
      data,
    });

    return NextResponse.json(ingressoAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar ingresso:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar ingresso." },
      { status: 500 }
    );
  }
}

// DELETE /api/ingressos/[id]
export async function DELETE(_req, context) {
  const { id } = context.params;

  try {
    const evento = await getEventoAtivo();
    if (!evento) {
      return NextResponse.json(
        { error: "Nenhum evento ativo encontrado." },
        { status: 404 }
      );
    }

    const ingresso = await prisma.ingresso.findUnique({
      where: { id: parseInt(id) },
    });

    if (!ingresso || ingresso.eventoId !== evento.id) {
      return NextResponse.json(
        { error: "Este ingresso não pertence ao evento ativo." },
        { status: 403 }
      );
    }

    await prisma.ingresso.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.code === "P2003") {
      return NextResponse.json(
        {
          error:
            "Este ingresso está vinculado a agendamentos e não pode ser excluído.",
        },
        { status: 400 }
      );
    }

    console.error("DELETE /api/ingressos/[id] error:", error);
    return NextResponse.json(
      { error: "Erro interno ao excluir ingresso" },
      { status: 500 }
    );
  }
}
