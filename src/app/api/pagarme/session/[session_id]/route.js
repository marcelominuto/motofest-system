import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(req, { params }) {
  try {
    const { session_id } = params;

    if (!session_id) {
      return NextResponse.json(
        { error: "ID da sessão não fornecido" },
        { status: 400 }
      );
    }

    // Buscar detalhes do link de pagamento no Pagar.me
    const response = await axios.get(
      `https://sdx-api.pagar.me/core/v5/paymentlinks/${session_id}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(process.env.PAGARME_API_KEY + ":").toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );

    const paymentLink = response.data;

    return NextResponse.json(paymentLink);
  } catch (error) {
    console.error("Erro ao buscar link de pagamento:", error);

    if (error.response) {
      console.error("Resposta do Pagar.me:", error.response.data);
      return NextResponse.json(
        {
          error: "Erro ao buscar link de pagamento",
          details: error.response.data,
        },
        { status: error.response.status }
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
