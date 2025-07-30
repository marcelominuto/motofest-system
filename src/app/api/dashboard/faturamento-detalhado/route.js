import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Função para calcular valor baseado na quantidade de motos
function calcularValorPorQuantidade(quantidade, ingresso) {
  if (quantidade >= 3) {
    // Calcular quantos grupos de 3 cabem
    const gruposDe3 = Math.floor(quantidade / 3);
    const resto = quantidade % 3;

    let valor = gruposDe3 * parseFloat(ingresso.valor3?.toString() || "0");

    if (resto === 2) {
      valor += parseFloat(ingresso.valor2?.toString() || "0");
    } else if (resto === 1) {
      valor += parseFloat(ingresso.valor1?.toString() || "0");
    }

    return valor;
  } else if (quantidade === 2) {
    return parseFloat(ingresso.valor2?.toString() || "0");
  } else {
    return parseFloat(ingresso.valor1?.toString() || "0");
  }
}

export async function GET() {
  try {
    // Buscar evento ativo
    const eventoAtivo = await prisma.evento.findFirst({
      where: { ativo: true },
    });

    if (!eventoAtivo) {
      return NextResponse.json({
        faturamentoPedidos: 0,
        faturamentoAgendamentosDiretos: 0,
        quantidadePedidos: 0,
        quantidadeAgendamentosDiretos: 0,
        quantidadeCortesias: 0,
        clientesComAgendamentosDiretos: 0,
      });
    }

    // 1. Pedidos pagos
    const pedidos = await prisma.pedido.findMany({
      where: {
        status: "pago",
        eventoId: eventoAtivo.id,
      },
      select: {
        valor: true,
      },
    });

    const faturamentoPedidos = pedidos.reduce((sum, pedido) => {
      const valor = parseFloat(pedido.valor.toString());
      return sum + valor;
    }, 0);

    // 2. Agendamentos diretos (sem pedido vinculado)
    const agendamentosDiretos = await prisma.agendamento.findMany({
      where: {
        eventoId: eventoAtivo.id,
        pedidoId: null,
        status: {
          not: "cortesia",
        },
      },
      include: {
        cliente: {
          select: {
            id: true,
          },
        },
        ingresso: {
          select: {
            valor1: true,
            valor2: true,
            valor3: true,
          },
        },
      },
    });

    // Agrupar agendamentos por cliente
    const agendamentosPorCliente = {};
    agendamentosDiretos.forEach((agendamento) => {
      const clienteId = agendamento.clienteId;
      if (!agendamentosPorCliente[clienteId]) {
        agendamentosPorCliente[clienteId] = {
          quantidade: 0,
          ingresso: agendamento.ingresso,
        };
      }
      agendamentosPorCliente[clienteId].quantidade++;
    });

    // Calcular faturamento baseado na quantidade de motos por cliente
    const faturamentoAgendamentosDiretos = Object.values(
      agendamentosPorCliente
    ).reduce((sum, cliente) => {
      const valor = calcularValorPorQuantidade(
        cliente.quantidade,
        cliente.ingresso
      );
      return sum + valor;
    }, 0);

    // 3. Contar cortesias
    const cortesias = await prisma.agendamento.count({
      where: {
        eventoId: eventoAtivo.id,
        status: "cortesia",
      },
    });

    return NextResponse.json({
      faturamentoPedidos,
      faturamentoAgendamentosDiretos,
      quantidadePedidos: pedidos.length,
      quantidadeAgendamentosDiretos: agendamentosDiretos.length,
      quantidadeCortesias: cortesias,
      clientesComAgendamentosDiretos: Object.keys(agendamentosPorCliente)
        .length,
    });
  } catch (error) {
    console.error("Erro ao buscar faturamento detalhado:", error);
    return NextResponse.json({
      faturamentoPedidos: 0,
      faturamentoAgendamentosDiretos: 0,
      quantidadePedidos: 0,
      quantidadeAgendamentosDiretos: 0,
      quantidadeCortesias: 0,
      clientesComAgendamentosDiretos: 0,
    });
  }
}
