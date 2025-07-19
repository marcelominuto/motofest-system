import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

function formatarDataBR(dataISO) {
  if (!dataISO) return "";
  const d = new Date(dataISO);
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const ano = String(d.getFullYear()).slice(-2);
  return `${dia}/${mes}/${ano}`;
}

export async function POST(req) {
  const body = await req.json();
  const {
    nome,
    email,
    cpf, // <-- Adicionado cpf
    valor,
    quantidade,
    ingressoId,
    tipo,
    descricao,
    detalhesAgendamento,
    agendamento,
    telefone, // <-- Adicionado telefone
  } = body;

  console.log("Body recebido na criação de sessão Stripe:", body); // Log para depuração

  if (!nome || !email || !valor || !quantidade || !ingressoId) {
    return NextResponse.json(
      { error: "Dados obrigatórios faltando" },
      { status: 400 }
    );
  }

  // Nome do produto: nome do ingresso (tipo) e quantidade de motos
  const nomeProduto = `${tipo} - ${quantidade} Moto${
    quantidade > 1 ? "s" : ""
  }`;

  // Resumo: cada moto em uma nova linha
  let resumo = "";
  try {
    const ags = Array.isArray(agendamento)
      ? agendamento
      : JSON.parse(agendamento || "[]");
    resumo = ags
      .map(
        (m, idx) =>
          `Moto ${idx + 1}: ${m.modelo || m.motoId}, Data: ${formatarDataBR(
            m.data
          )}, Horário: ${m.horario || m.horarioId}`
      )
      .join(" | ");
  } catch {
    resumo = detalhesAgendamento || "";
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: nomeProduto,
              description: resumo,
            },
            unit_amount: Math.round(Number(valor) * 100),
          },
          quantity: 1, // Valor já é o total, não unitário
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/ingressos/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/ingressos/`,
      metadata: {
        ingressoId,
        nome,
        email,
        cpf, // <-- Adicionado cpf ao metadata
        telefone, // <-- Adicionado telefone ao metadata
        detalhesAgendamento: detalhesAgendamento || "",
        agendamento: agendamento ? JSON.stringify(agendamento) : "",
      },
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Erro ao criar sessão Stripe:", error);
    return NextResponse.json(
      { error: "Erro ao criar sessão de pagamento" },
      { status: 500 }
    );
  }
}
