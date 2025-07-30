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
      return NextResponse.json({ projecao: 0 });
    }

    // Calcular dias restantes do evento
    const hoje = new Date();
    const diasRestantes = Math.ceil(
      (eventoAtivo.dataFim - hoje) / (1000 * 60 * 60 * 24)
    );

    if (diasRestantes <= 0) {
      return NextResponse.json({ projecao: 0 });
    }

    // Buscar faturamento dos últimos 7 dias (incluindo agendamentos diretos)
    const umaSemanaAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. Pedidos pagos dos últimos 7 dias
    const pedidos = await prisma.pedido.findMany({
      where: {
        status: "pago",
        eventoId: eventoAtivo.id,
        createdAt: {
          gte: umaSemanaAtras,
        },
      },
      select: {
        valor: true,
        createdAt: true,
      },
    });

    const faturamentoPedidos = pedidos.reduce((sum, pedido) => {
      return sum + parseFloat(pedido.valor.toString());
    }, 0);

    // 2. Agendamentos diretos dos últimos 7 dias (usando createdAt para quando foi criado)
    const agendamentosDiretos = await prisma.agendamento.findMany({
      where: {
        eventoId: eventoAtivo.id,
        pedidoId: null,
        status: {
          not: "cortesia",
        },
        createdAt: {
          gte: umaSemanaAtras,
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

    // Calcular faturamento médio diário dos últimos 7 dias
    const faturamentoTotal =
      faturamentoPedidos + faturamentoAgendamentosDiretos;
    const faturamentoMedioDiario = faturamentoTotal / 7;

    // Projeção = faturamento médio diário × dias restantes
    const projecao = faturamentoMedioDiario * diasRestantes;

    return NextResponse.json({
      projecao: Math.round(projecao),
      diasRestantes,
      faturamentoMedioDiario: Math.round(faturamentoMedioDiario),
      faturamentoPedidos,
      faturamentoAgendamentosDiretos,
      quantidadeAgendamentosDiretos: agendamentosDiretos.length,
      quantidadePedidos: pedidos.length,
      clientesComAgendamentosDiretos: Object.keys(agendamentosPorCliente)
        .length,
    });
  } catch (error) {
    console.error("Erro ao calcular projeção de receita:", error);
    return NextResponse.json({ projecao: 0 });
  }
}
