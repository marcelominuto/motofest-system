import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getEventoAtivo } from "@/lib/getEventoAtivo";

// PUT: Atualizar status do pedido
export async function PUT(req, context) {
  const params = await context.params;
  const { id } = await params;
  const { status } = await req.json();

  if (!status) {
    return NextResponse.json(
      { error: "Status é obrigatório" },
      { status: 400 }
    );
  }

  try {
    const evento = await getEventoAtivo();
    if (!evento) {
      return NextResponse.json(
        { error: "Nenhum evento ativo encontrado" },
        { status: 404 }
      );
    }

    // Busca o pedido
    const pedido = await prisma.pedido.findUnique({
      where: { id: parseInt(id) },
      include: { agendamentos: true },
    });

    if (!pedido || pedido.eventoId !== evento.id) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    // Atualiza o pedido e os agendamentos vinculados em uma transação
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Atualiza o status do pedido
      const pedidoAtualizado = await tx.pedido.update({
        where: { id: parseInt(id) },
        data: { status },
      });

      // 2. Atualiza o status dos agendamentos vinculados
      if (pedido.agendamentos.length > 0) {
        await tx.agendamento.updateMany({
          where: { pedidoId: parseInt(id) },
          data: {
            status: status === "pago" ? "pago" : "pendente",
          },
        });
      }

      return pedidoAtualizado;
    });

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("PUT /api/pedidos/[id] error:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar pedido" },
      { status: 500 }
    );
  }
}

// GET: Buscar pedido específico
export async function GET(req, context) {
  const params = await context.params;
  const { id } = await params;

  try {
    const evento = await getEventoAtivo();
    if (!evento) {
      return NextResponse.json(
        { error: "Nenhum evento ativo encontrado" },
        { status: 404 }
      );
    }

    const pedido = await prisma.pedido.findUnique({
      where: { id: parseInt(id) },
      include: {
        cliente: true,
        agendamentos: {
          include: {
            moto: { include: { marca: true } },
            horario: true,
            ingresso: true,
          },
        },
      },
    });

    if (!pedido || pedido.eventoId !== evento.id) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(pedido);
  } catch (error) {
    console.error("GET /api/pedidos/[id] error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pedido" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const { id } = params;
  if (!id)
    return NextResponse.json(
      { error: "ID do pedido não informado" },
      { status: 400 }
    );
  try {
    // Exclui agendamentos vinculados
    await prisma.agendamento.deleteMany({
      where: { pedidoId: parseInt(id, 10) },
    });
    // Atualiza o status do pedido para cancelado
    await prisma.pedido.update({
      where: { id: parseInt(id, 10) },
      data: { status: "cancelado" },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao cancelar pedido:", error);
    return NextResponse.json(
      { error: "Erro ao cancelar pedido" },
      { status: 500 }
    );
  }
}
