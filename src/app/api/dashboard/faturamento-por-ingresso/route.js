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
      return NextResponse.json([]);
    }

    // Inicializar objeto para armazenar faturamento por tipo de ingresso
    const faturamentoPorTipo = {};

    // 1. Faturamento de Pedidos Pagos
    const pedidos = await prisma.pedido.findMany({
      where: {
        status: "pago",
        eventoId: eventoAtivo.id,
      },
      include: {
        agendamentos: {
          include: {
            moto: {
              include: {
                ingresso: true,
              },
            },
          },
        },
      },
    });

    pedidos.forEach((pedido) => {
      // Pegar o tipo de ingresso do primeiro agendamento (todos devem ser do mesmo tipo)
      if (pedido.agendamentos.length > 0) {
        const tipo = pedido.agendamentos[0].moto?.ingresso?.tipo || "Sem tipo";
        const valor = parseFloat(pedido.valor.toString());

        if (!faturamentoPorTipo[tipo]) {
          faturamentoPorTipo[tipo] = {
            tipo,
            faturamento: 0,
            quantidade: 0,
          };
        }

        faturamentoPorTipo[tipo].faturamento += valor;
        faturamentoPorTipo[tipo].quantidade += pedido.agendamentos.length;
      }
    });

    // 2. Faturamento de Agendamentos Diretos (sem pedido vinculado)
    const agendamentosDiretos = await prisma.agendamento.findMany({
      where: {
        eventoId: eventoAtivo.id,
        pedidoId: null,
        status: {
          not: "cortesia",
        },
      },
      include: {
        moto: {
          include: {
            ingresso: true,
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

    // Agrupar agendamentos diretos por cliente e tipo de ingresso
    const agendamentosPorClienteTipo = {};

    agendamentosDiretos.forEach((agendamento) => {
      const tipo = agendamento.moto?.ingresso?.tipo || "Sem tipo";
      const clienteId = agendamento.clienteId;
      const chave = `${clienteId}-${tipo}`;

      if (!agendamentosPorClienteTipo[chave]) {
        agendamentosPorClienteTipo[chave] = {
          tipo,
          quantidade: 0,
          ingresso: agendamento.ingresso,
        };
      }
      agendamentosPorClienteTipo[chave].quantidade++;
    });

    // Calcular faturamento dos agendamentos diretos
    Object.values(agendamentosPorClienteTipo).forEach((grupo) => {
      const valor = calcularValorPorQuantidade(
        grupo.quantidade,
        grupo.ingresso
      );

      if (!faturamentoPorTipo[grupo.tipo]) {
        faturamentoPorTipo[grupo.tipo] = {
          tipo: grupo.tipo,
          faturamento: 0,
          quantidade: 0,
        };
      }

      faturamentoPorTipo[grupo.tipo].faturamento += valor;
      faturamentoPorTipo[grupo.tipo].quantidade += grupo.quantidade;
    });

    // Converter para array e ordenar por faturamento
    const resposta = Object.values(faturamentoPorTipo).sort(
      (a, b) => b.faturamento - a.faturamento
    );

    return NextResponse.json(resposta);
  } catch (error) {
    console.error("Erro ao buscar faturamento por tipo de ingresso:", error);
    return NextResponse.json([]);
  }
}
