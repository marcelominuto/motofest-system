import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
  try {
    const body = await req.json();

    console.log("Dados recebidos:", body);

    const {
      nome,
      email,
      cpf,
      telefone,
      valor,
      quantidade,
      ingressoId,
      tipo,
      detalhesAgendamento,
      agendamento,
    } = body;

    // Validar dados obrigatórios
    if (!nome || !email || !cpf || !telefone || !valor || !quantidade) {
      return NextResponse.json(
        { error: "Dados obrigatórios não fornecidos" },
        { status: 400 }
      );
    }

    // Gerar código único do pedido
    const codigoPedido = `PEDIDO_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    console.log("Dados processados:", {
      nome,
      email,
      cpf,
      telefone,
      valor,
      quantidade,
      ingressoId,
      tipo,
    });

    // Criar link de pagamento seguindo a documentação oficial
    const linkData = {
      is_building: false,
      payment_settings: {
        credit_card_settings: {
          operation_type: "auth_and_capture",
          installments_setup: {
            max_installments: 3,
            amount: valor * 100,
            interest_type: "simple",
            interest_rate: 0,
            free_installments: 3,
          },
        },
        pix_settings: {
          expires_in: 3600,
          additional_information: [
            {
              name: "Instruções",
              value: "Escaneie o QR Code com seu app bancário",
            },
          ],
        },
        accepted_payment_methods: ["credit_card", "pix"],
      },
      cart_settings: {
        items: [
          {
            amount: valor * 100,
            name: `${tipo}`,
            description: detalhesAgendamento,
            default_quantity: 1,
          },
        ],
      },
      customer_settings: {
        customer: {
          name: nome,
          email: email,
          document: cpf.replace(/\D/g, ""),
          document_type: "CPF",
          type: "individual",
          phones: {
            mobile_phone: {
              country_code: "55",
              area_code: telefone.replace(/\D/g, "").substring(0, 2),
              number: telefone.replace(/\D/g, "").substring(2),
            },
          },
        },
      },
      name: `${tipo} - ${nome}`,
      type: "order",
      expires_in: 3600,
      layout_settings: {
        image_url: "https://i.ibb.co/vv1wTfKV/logo-smf-red-black.png",
        primary_color: "#E3180A",
        secondary_color: "#B3140A",
      },
      metadata: {
        codigo_pedido: codigoPedido,
        tipo: tipo,
        nome: nome,
        email: email,
        cpf: cpf,
        telefone: telefone,
        valor: valor.toString(),
        quantidade: quantidade.toString(),
        ingresso_id: ingressoId.toString(),
        detalhes_agendamento: detalhesAgendamento,
        agendamento: JSON.stringify(agendamento),
      },
    };

    console.log("Dados do link:", JSON.stringify(linkData, null, 2));

    // Fazer requisição para Pagar.me - Links de Pagamento
    const pagarmeApiUrl =
      process.env.PAGARME_API_URL ||
      "https://sdx-api.pagar.me/core/v5/paymentlinks";
    const response = await axios.post(pagarmeApiUrl, linkData, {
      headers: {
        Authorization: `Basic ${Buffer.from(process.env.PAGARME_API_KEY + ":").toString("base64")}`,
        "Content-Type": "application/json",
      },
    });

    const paymentLink = response.data;

    console.log("Link de pagamento criado:", paymentLink.id);
    console.log("URL do checkout:", paymentLink.url);

    return NextResponse.json({
      url: paymentLink.url,
      link_id: paymentLink.id,
      expires_at: paymentLink.expires_at,
    });
  } catch (error) {
    console.error("Erro ao criar sessão de pagamento:", error);

    if (error.response) {
      console.error("Resposta do Pagar.me:", error.response.data);
      return NextResponse.json(
        { error: "Erro na criação do pagamento", details: error.response.data },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
