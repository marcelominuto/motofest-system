import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getEventoAtivo } from "@/lib/getEventoAtivo";

// GET: Listar todos os pedidos do evento ativo
export async function GET(req) {
  try {
    const url = new URL(req.url, "http://localhost");
    const paymentIntentId = url.searchParams.get("paymentIntentId");
    const evento = await getEventoAtivo();
    if (!evento) {
      return NextResponse.json(
        { error: "Nenhum evento ativo encontrado" },
        { status: 404 }
      );
    }
    const where = { eventoId: evento.id };
    if (paymentIntentId) where.paymentIntentId = paymentIntentId;
    const pedidos = await prisma.pedido.findMany({
      where,
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
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(pedidos);
  } catch (error) {
    console.error("GET /api/pedidos error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pedidos" },
      { status: 500 }
    );
  }
}

// POST: Criar pedido com agendamentos
export async function POST(req) {
  try {
    const evento = await getEventoAtivo();
    if (!evento) {
      return NextResponse.json(
        { error: "Nenhum evento ativo encontrado" },
        { status: 404 }
      );
    }

    const { clienteId, agendamentos, valor } = await req.json();

    if (
      !clienteId ||
      !Array.isArray(agendamentos) ||
      agendamentos.length === 0
    ) {
      return NextResponse.json(
        { error: "Dados incompletos para criar pedido" },
        { status: 400 }
      );
    }

    // Verifica se o cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 }
      );
    }

    // Validação de conflitos do cliente (mesmo horário/data)
    const conflitos = await Promise.all(
      agendamentos.map(async (a) => {
        const conflito = await prisma.agendamento.findFirst({
          where: {
            clienteId,
            data: new Date(a.data),
            horarioId: parseInt(a.horarioId, 10),
            eventoId: evento.id,
          },
        });

        return conflito;
      })
    );

    if (conflitos.some(Boolean)) {
      return NextResponse.json(
        { error: "O cliente já possui agendamento neste horário e data" },
        { status: 409 }
      );
    }

    // Verifica disponibilidade das motos
    for (const { motoId, horarioId, data, ingressoId } of agendamentos) {
      if (!ingressoId || isNaN(parseInt(ingressoId, 10))) {
        return NextResponse.json(
          { error: "Ingresso inválido" },
          { status: 400 }
        );
      }

      if (!motoId || isNaN(parseInt(motoId, 10))) {
        return NextResponse.json({ error: "Moto inválida" }, { status: 400 });
      }

      if (!horarioId || isNaN(parseInt(horarioId, 10))) {
        return NextResponse.json(
          { error: "Horário inválido" },
          { status: 400 }
        );
      }
      // Conta agendamentos existentes
      const total = await prisma.agendamento.count({
        where: {
          motoId: parseInt(motoId, 10),
          horarioId: parseInt(horarioId, 10),
          data: new Date(data),
          eventoId: evento.id,
        },
      });

      const moto = await prisma.moto.findUnique({
        where: { id: parseInt(motoId, 10) },
      });

      if (!moto) {
        return NextResponse.json(
          { error: `Moto ${motoId} não encontrada` },
          { status: 404 }
        );
      }

      if (total >= moto.quantidade) {
        return NextResponse.json(
          {
            error: `Limite de agendamentos excedido para a moto ${moto.nome} no horário selecionado`,
          },
          { status: 409 }
        );
      }
    }

    // Cria o pedido e os agendamentos em uma transação
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Cria o pedido (sem código)
      let pedido = await tx.pedido.create({
        data: {
          clienteId,
          eventoId: evento.id,
          valor: parseFloat(valor),
          status: "pendente",
        },
      });

      // 2. Gera o código e atualiza o pedido
      const codigo = `SMF#${pedido.id}`;
      pedido = await tx.pedido.update({
        where: { id: pedido.id },
        data: { codigo },
      });

      // 3. Cria os agendamentos vinculados ao pedido
      const agendamentosCriados = await Promise.all(
        agendamentos.map(async ({ ingressoId, motoId, data, horarioId }) => {
          return tx.agendamento.create({
            data: {
              cliente: { connect: { id: clienteId } },
              ingresso: { connect: { id: parseInt(ingressoId, 10) } },
              moto: { connect: { id: parseInt(motoId, 10) } },
              horario: { connect: { id: parseInt(horarioId, 10) } },
              evento: { connect: { id: evento.id } },
              pedido: { connect: { id: pedido.id } },
              data: new Date(data),
              status: "pendente",
              codigo: `PED-${pedido.id}-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
            },
          });
        })
      );

      return { pedido, agendamentos: agendamentosCriados };
    });

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Erro no POST /api/pedidos:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar pedido" },
      { status: 500 }
    );
  }
}
