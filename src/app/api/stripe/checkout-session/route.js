import { NextResponse } from "next/server";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function formatarDataBR(dataISO) {
  if (!dataISO) return "";
  // Se vier no formato YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss
  const [datePart] = dataISO.split("T");
  const [year, month, day] = datePart.split("-");
  return `${day}/${month}/${year}`;
}

export async function POST(req) {
  try {
    const { ingressoId, clienteId } = await req.json();

    // Pegar o domínio baseado no request
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const host = req.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
    });

    if (!cliente) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    const ingresso = await prisma.ingresso.findUnique({
      where: { id: ingressoId },
    });

    if (!ingresso) {
      return NextResponse.json({ error: "Ingresso não encontrado" }, { status: 404 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: ingresso.tipo,
              description: ingresso.descricao || `Ingresso ${ingresso.tipo}`,
            },
            unit_amount: Math.round(ingresso.valor * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/ingressos/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/ingressos/`,
      metadata: {
        clienteId: clienteId.toString(),
        ingressoId: ingressoId.toString(),
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Erro ao criar sessão de checkout:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
