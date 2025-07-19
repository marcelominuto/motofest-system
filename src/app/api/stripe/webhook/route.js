import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { getEventoAtivo } from "@/lib/getEventoAtivo";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");
  const buf = await req.arrayBuffer();
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(buf),
      sig,
      endpointSecret
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return NextResponse.json(
      { error: "Webhook signature verification failed." },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = session.metadata || {};
    const clienteNome = metadata.nome;
    const clienteEmail = metadata.email;
    const ingressoId = metadata.ingressoId;
    const detalhesAgendamento = metadata.detalhesAgendamento;
    let agendamento = [];
    try {
      agendamento = metadata.agendamento
        ? JSON.parse(metadata.agendamento)
        : [];
    } catch {}
    const valor = session.amount_total ? session.amount_total / 100 : 0;

    // Buscar evento ativo
    const evento = await getEventoAtivo();
    if (!evento) {
      console.error(
        "Nenhum evento ativo encontrado ao processar webhook Stripe"
      );
      return NextResponse.json(
        { error: "Nenhum evento ativo" },
        { status: 404 }
      );
    }

    // Buscar cliente por CPF (se vier no metadata), senão por e-mail
    let cliente = null;
    const cpf = metadata.cpf && metadata.cpf.trim() ? metadata.cpf.trim() : "";
    if (cpf) {
      cliente = await prisma.cliente.findUnique({ where: { cpf } });
    }
    if (!cliente && clienteEmail) {
      cliente = await prisma.cliente.findFirst({
        where: { email: clienteEmail },
      });
    }
    // Se encontrou cliente por CPF, sempre usa os dados do banco (ignora nome/email do input)
    // Só cria cliente se CPF não for vazio e não existir ainda
    if (!cliente && cpf) {
      cliente = await prisma.cliente.create({
        data: {
          nome: clienteNome || "Cliente Stripe",
          email: clienteEmail,
          cpf: cpf,
          cnh: "",
        },
      });
    }
    // Se não encontrou cliente e CPF está vazio, não cria cliente novo
    if (!cliente) {
      return NextResponse.json(
        { error: "CPF obrigatório para criar cliente novo" },
        { status: 400 }
      );
    }

    // Buscar método de pagamento real (expandindo charges)
    let metodoPagamento = null;
    if (session.payment_intent) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          session.payment_intent,
          { expand: ["charges"] }
        );
        metodoPagamento =
          paymentIntent.charges?.data?.[0]?.payment_method_details?.type ||
          null;
        console.log(
          "Método de pagamento detectado na criação do pedido:",
          metodoPagamento
        );
      } catch (e) {
        console.error(
          "Erro ao buscar PaymentIntent para método de pagamento:",
          e
        );
      }
    }

    // Log detalhado dos dados recebidos
    console.log(
      "Webhook Stripe - Dados recebidos para pedido/agendamento:",
      JSON.stringify({ metadata, agendamento, valor }, null, 2)
    );

    // Criar pedido e agendamentos em transação
    let resultado;
    try {
      resultado = await prisma.$transaction(async (tx) => {
        // 1. Cria o pedido com código temporário
        let pedido = await tx.pedido.create({
          data: {
            clienteId: cliente.id,
            eventoId: evento.id,
            valor: valor,
            status: "pago",
            codigo: "PENDENTE",
            metodoPagamento: metodoPagamento,
            paymentIntentId: session.payment_intent || null,
          },
        });
        // 2. Atualiza o código para SMF#1000+id
        const codigo = `SMF#${1000 + pedido.id}`;
        pedido = await tx.pedido.update({
          where: { id: pedido.id },
          data: { codigo },
        });
        // 3. Cria os agendamentos vinculados ao pedido
        const agendamentosCriados = await Promise.all(
          agendamento.map(async (a) => {
            console.log("Criando agendamento:", a);
            return tx.agendamento.create({
              data: {
                cliente: { connect: { id: cliente.id } },
                ingresso: { connect: { id: parseInt(ingressoId, 10) } },
                moto: { connect: { id: parseInt(a.motoId, 10) } },
                horario: { connect: { id: parseInt(a.horarioId, 10) } },
                evento: { connect: { id: evento.id } },
                pedido: { connect: { id: pedido.id } },
                data: new Date(a.data),
                status: "pago",
                checkin: false,
                codigo: `PED-${pedido.id}-${Date.now()}-${Math.random()
                  .toString(36)
                  .substr(2, 9)}`,
              },
            });
          })
        );
        return { pedido, agendamentos: agendamentosCriados };
      });
      // Fora da transação: retry para buscar e atualizar o método de pagamento
      if (session.payment_intent && resultado && resultado.pedido) {
        let metodoPagamentoFinal = null;
        for (let i = 0; i < 3; i++) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          const paymentIntent = await stripe.paymentIntents.retrieve(
            session.payment_intent,
            { expand: ["charges"] }
          );
          metodoPagamentoFinal =
            paymentIntent.charges?.data?.[0]?.payment_method_details?.type ||
            null;
          if (metodoPagamentoFinal) {
            await prisma.pedido.update({
              where: { id: resultado.pedido.id },
              data: { metodoPagamento: metodoPagamentoFinal },
            });
            console.log(
              "Método de pagamento atualizado após retry:",
              metodoPagamentoFinal
            );
            break;
          }
        }
      }
      console.log(
        "Pedido e agendamentos criados via Stripe webhook:",
        resultado
      );
    } catch (err) {
      console.error(
        "Erro ao criar pedido/agendamentos via Stripe webhook:",
        err
      );
      return NextResponse.json(
        { error: "Erro ao criar pedido/agendamentos" },
        { status: 500 }
      );
    }
  }

  // Novo: atualizar metodoPagamento quando o pagamento for realmente confirmado
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const metodoPagamento =
      paymentIntent.charges?.data?.[0]?.payment_method_details?.type || null;
    console.log("Webhook payment_intent.succeeded:", {
      paymentIntentId: paymentIntent.id,
      metodoPagamento,
    });
    try {
      const result = await prisma.pedido.updateMany({
        where: { paymentIntentId: paymentIntent.id },
        data: { metodoPagamento },
      });
      console.log("Pedidos atualizados:", result);
    } catch (e) {
      console.error(
        "Erro ao atualizar metodoPagamento no payment_intent.succeeded:",
        e
      );
    }
  }

  if (event.type === "charge.succeeded") {
    const charge = event.data.object;
    const metodoPagamento = charge.payment_method_details?.type || null;
    const paymentIntentId = charge.payment_intent;
    console.log("Webhook charge.succeeded:", {
      paymentIntentId,
      metodoPagamento,
    });
    try {
      const result = await prisma.pedido.updateMany({
        where: { paymentIntentId },
        data: { metodoPagamento },
      });
      console.log("Pedidos atualizados (charge.succeeded):", result);
    } catch (e) {
      console.error(
        "Erro ao atualizar metodoPagamento no charge.succeeded:",
        e
      );
    }
  }

  return NextResponse.json({ received: true });
}
