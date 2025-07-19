import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function GET(req, context) {
  const { session_id } = await context.params;
  if (!session_id)
    return NextResponse.json(
      { error: "session_id obrigatório" },
      { status: 400 }
    );
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    return NextResponse.json(session);
  } catch (e) {
    return NextResponse.json(
      { error: "Sessão não encontrada" },
      { status: 404 }
    );
  }
}
