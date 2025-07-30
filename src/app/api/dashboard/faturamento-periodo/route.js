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
        hoje: 0,
        semana: 0,
        mes: 0,
      });
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const umaSemanaAtras = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
    const umMesAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Função para calcular faturamento por período
    const calcularFaturamento = async (dataInicio) => {
      // 1. Pedidos pagos no período
      const pedidos = await prisma.pedido.findMany({
        where: {
          status: "pago",
          eventoId: eventoAtivo.id,
          createdAt: {
            gte: dataInicio,
          },
        },
        select: {
          valor: true,
        },
      });

      const faturamentoPedidos = pedidos.reduce((sum, pedido) => {
        return sum + parseFloat(pedido.valor.toString());
      }, 0);

      // 2. Agendamentos diretos no período (usando createdAt para quando foi criado)
      const agendamentosDiretos = await prisma.agendamento.findMany({
        where: {
          eventoId: eventoAtivo.id,
          pedidoId: null,
          status: {
            not: "cortesia",
          },
          createdAt: {
            gte: dataInicio,
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

      return faturamentoPedidos + faturamentoAgendamentosDiretos;
    };

    // Calcular faturamento para cada período
    const faturamentoHoje = await calcularFaturamento(hoje);
    const faturamentoSemana = await calcularFaturamento(umaSemanaAtras);
    const faturamentoMes = await calcularFaturamento(umMesAtras);

    return NextResponse.json({
      hoje: faturamentoHoje,
      semana: faturamentoSemana,
      mes: faturamentoMes,
    });
  } catch (error) {
    console.error("Erro ao buscar faturamento por período:", error);
    return NextResponse.json({
      hoje: 0,
      semana: 0,
      mes: 0,
    });
  }
}
