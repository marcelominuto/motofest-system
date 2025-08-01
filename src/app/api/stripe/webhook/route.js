import { NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { getEventoAtivo } from "@/lib/getEventoAtivo";
import { sendEmail } from "@/lib/sendEmail";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  console.log("Webhook Stripe recebido: início do handler");
  const sig = req.headers.get("stripe-signature");
  const buf = await req.arrayBuffer();
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(buf),
      sig,
      endpointSecret
    );
    console.log("Webhook Stripe recebido:", event.type);
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return NextResponse.json(
      { error: "Webhook signature verification failed." },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    console.log("Entrou no bloco checkout.session.completed");
    const session = event.data.object;
    // Proteção contra duplicidade
    const pedidoExistente = await prisma.pedido.findFirst({
      where: { paymentIntentId: session.payment_intent },
    });
    if (pedidoExistente) {
      console.log(
        "Pedido já existe para este paymentIntentId, ignorando duplicidade."
      );
      return NextResponse.json({ received: true, duplicated: true });
    }
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
      const clienteTelefone = metadata.telefone || "";
      cliente = await prisma.cliente.create({
        data: {
          nome: clienteNome || "Cliente Stripe",
          email: clienteEmail,
          cpf: cpf,
          telefone: clienteTelefone,
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
        console.log(
          "PaymentIntent completo:",
          JSON.stringify(paymentIntent, null, 2)
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
        console.log("Iniciando retry para buscar método de pagamento...");
        let metodoPagamentoFinal = null;
        for (let i = 0; i < 5; i++) {
          console.log(`Tentativa ${i + 1} de buscar método de pagamento...`);
          await new Promise((resolve) => setTimeout(resolve, 3000));
          try {
            const paymentIntent = await stripe.paymentIntents.retrieve(
              session.payment_intent,
              { expand: ["charges"] }
            );
            console.log(
              `PaymentIntent na tentativa ${i + 1}:`,
              JSON.stringify(paymentIntent, null, 2)
            );
            metodoPagamentoFinal =
              paymentIntent.charges?.data?.[0]?.payment_method_details?.type ||
              null;
            console.log(
              `Método encontrado na tentativa ${i + 1}:`,
              metodoPagamentoFinal
            );
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
          } catch (e) {
            console.error(`Erro na tentativa ${i + 1}:`, e);
          }
        }
        if (!metodoPagamentoFinal) {
          console.log("Método de pagamento não encontrado após 5 tentativas");
        }
      }
      // Buscar agendamentos completos para o e-mail
      let agendamentosCompletos = [];
      try {
        agendamentosCompletos = await prisma.agendamento.findMany({
          where: { pedidoId: resultado.pedido.id },
          include: {
            moto: { include: { marca: true } },
            horario: true,
          },
        });
      } catch (e) {
        console.error("Erro ao buscar agendamentos completos para e-mail:", e);
        agendamentosCompletos = resultado.agendamentos;
      }

      // Enviar webhook para Discord (PEDIDO CONFIRMADO)
      try {
        const motosString = agendamentosCompletos
          .map((a) => {
            const dataStr =
              typeof a.data === "string"
                ? a.data
                : a.data instanceof Date
                  ? a.data.toISOString()
                  : "";
            const [year, month, day] = dataStr.split("T")[0].split("-");
            const motoLabel = a.moto?.nome || a.modelo || "-";
            const marcaLabel = a.moto?.marca?.nome || "-";
            const horarioLabel = a.horario?.hora || a.horario || "-";
            return `${marcaLabel} ${motoLabel} - ${day}/${month}/${year} - ${horarioLabel}`;
          })
          .join("\n");
        const discordPayload = {
          content: "",
          tts: false,
          embeds: [
            {
              title: "PEDIDO CONFIRMADO!",
              color: 3066993,
              timestamp: new Date().toISOString(),
              fields: [
                {
                  id: 477098321,
                  name: "Nome",
                  value: cliente.nome,
                  inline: true,
                },
                { id: 531816709, name: "CPF", value: cliente.cpf },
                { id: 980485366, name: "E-mail", value: cliente.email },
                {
                  id: 104269543,
                  name: "Telefone",
                  value: `${cliente.telefone}\n[Whatsapp](<https://wa.me/${(cliente.telefone || "").replace(/\D/g, "")}>)`,
                },
                { id: 979321908, name: "Motos", value: motosString },
                {
                  id: 123456789,
                  name: "Tipo de Ingresso",
                  value: metadata.tipo || "-",
                },
                {
                  id: 987654321,
                  name: "Valor",
                  value: `R$ ${(valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                },
              ],
            },
          ],
          components: [],
          actions: {},
          flags: 0,
          username: "SALÃO MOTO FEST",
          avatar_url: "https://i.ibb.co/YBC3HZtG/LOGO.png",
        };
        const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
        if (discordWebhookUrl) {
          const protocol = req.headers.get('x-forwarded-proto') || 'http';
          const host = req.headers.get('host') || 'localhost:3000';
          const baseUrl = `${protocol}://${host}`;
          
          await fetch(discordWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              embeds: [
                {
                  title: "🎫 Novo Pedido Recebido",
                  color: 0x00ff00,
                  fields: [
                    { name: "Cliente", value: cliente.nome, inline: true },
                    { name: "Email", value: cliente.email, inline: true },
                    { name: "CPF", value: cliente.cpf, inline: true },
                    { name: "Ingresso", value: metadata.tipo || "-", inline: true },
                    { name: "Valor", value: `R$ ${valor}`, inline: true },
                    { name: "Status", value: "Pago", inline: true },
                  ],
                  footer: { text: "Salão Moto Fest 2025" },
                  timestamp: new Date().toISOString(),
                },
              ],
            }),
          });
        }
      } catch (err) {
        console.error("Erro ao enviar webhook para Discord:", err);
      }

      // Enviar e-mail de confirmação para o cliente
      console.log("Preparando para enviar e-mail para:", cliente.email);
      try {
        await sendEmail({
          to: cliente.email,
          subject: `Seu pedido MotoFest foi confirmado! [${resultado.pedido.codigo}]`,
          html: `
            <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 0; margin: 0;">
              <div style="max-width: 520px; margin: 32px auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 12px #0002; padding: 0 0 32px 0; overflow: hidden;">
                <div style="background: #d32f2f; padding: 32px 0 16px 0; text-align: center;">
                  <img src="https://drive.google.com/uc?export=view&id=1MT9iMz0_1H5MuSSlvjfTwrDpnCfi5Xuj" alt="MotoFest" style="height: 56px; margin-bottom: 8px;" />
                  <div style="color: #fff; font-size: 1.2rem; letter-spacing: 1px;">A sua experiência real começa aqui</div>
                </div>
                <div style="padding: 32px 32px 0 32px;">
                  <h2 style="color: #d32f2f; font-size: 1.3rem; margin-bottom: 8px;">Olá, <b>${cliente.nome}</b>!</h2>
                  <p style="font-size: 1.1rem; color: #222; margin-bottom: 16px;">Sua compra para o MotoFest foi realizada com sucesso!<br>Leve este e-mail e seu documento no dia do evento.</p>
                  <div style="border-top: 2px solid #d32f2f; margin: 24px 0 16px 0;"></div>
                  <h3 style="color: #d32f2f; font-size: 1.1rem; margin-bottom: 8px;">Resumo da compra</h3>
                  <table style="width:100%; border-collapse:collapse; margin-bottom: 16px;">
                    <thead>
                      <tr style="background:#f2f2f2; color:#222;">
                        <th style="padding:8px; border-radius:4px 0 0 4px;">Moto</th>
                        <th style="padding:8px;">Marca</th>
                        <th style="padding:8px;">Data</th>
                        <th style="padding:8px; border-radius:0 4px 4px 0;">Horário</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${agendamentosCompletos
                        .map((a) => {
                          const dataStr =
                            typeof a.data === "string"
                              ? a.data
                              : a.data instanceof Date
                                ? a.data.toISOString()
                                : "";
                          const [year, month, day] = dataStr
                            .split("T")[0]
                            .split("-");
                          const motoLabel = a.moto?.nome || a.modelo || "-";
                          const marcaLabel = a.moto?.marca?.nome || "-";
                          const horarioLabel =
                            a.horario?.hora || a.horario || "-";
                          return `<tr style="background:#fff; color:#222; text-align:center;">
                          <td style="padding:8px; border-bottom:1px solid #eee;">${motoLabel}</td>
                          <td style="padding:8px; border-bottom:1px solid #eee;">${marcaLabel}</td>
                          <td style="padding:8px; border-bottom:1px solid #eee;">${day}/${month}/${year}</td>
                          <td style="padding:8px; border-bottom:1px solid #eee;">${horarioLabel}</td>
                        </tr>`;
                        })
                        .join("")}
                    </tbody>
                  </table>
                  <div style="margin-bottom: 12px;">
                    <b>Total:</b> R$ ${resultado.pedido.valor}<br/>
                    <b>Status:</b> ${resultado.pedido.status}<br/>
                    <b>Código do pedido:</b> ${resultado.pedido.codigo}<br/>
                    <b>Método de pagamento:</b> ${resultado.pedido.metodoPagamento ? resultado.pedido.metodoPagamento.toUpperCase() : "-"}
                  </div>

                  <div style="margin: 32px 0 0 0; padding: 24px 24px 16px 24px; background: #f9f9f9; border-radius: 8px;">
                    <h3 style="color: #d32f2f; font-size: 1.1rem; margin-bottom: 10px;">O que levar no dia do evento</h3>
                    <ul style="color: #222; font-size: 1rem; margin-bottom: 16px; padding-left: 20px;">
                      <li>✔️ Este e-mail de confirmação (impresso ou no celular)</li>
                      <li>✔️ Documento oficial com foto (RG ou CNH)</li>
                      <li>✔️ CNH válida – categoria A</li>
                      <li>✔️ Equipamentos de segurança obrigatórios:<br>
                        &nbsp;&nbsp;- Capacete fechado<br>
                        &nbsp;&nbsp;- Jaqueta de manga longa<br>
                        &nbsp;&nbsp;- Calça comprida<br>
                        &nbsp;&nbsp;- Calçado fechado
                      </li>
                    </ul>
                    <div style="color: #d32f2f; font-size: 0.98rem; margin-bottom: 10px;">
                      ⚠️ Participantes que não estiverem com os itens exigidos não poderão realizar o test ride por motivos de segurança.
                    </div>
                    <h3 style="color: #d32f2f; font-size: 1.1rem; margin-bottom: 10px;">Termos de participação</h3>
                    <ul style="color: #222; font-size: 1rem; margin-bottom: 0; padding-left: 20px;">
                      <li>📄 O ingresso é nominal e intransferível</li>
                      <li>⏰ Chegue com no mínimo 15 minutos de antecedência do seu horário agendado</li>
                      <li>🚫 A apresentação de prints ou fotografias do ingresso não será aceita</li>
                      <li>❗ Em caso de atraso ou ausência, o agendamento poderá ser cancelado sem reembolso</li>
                      <li>🌧️ O test ride está sujeito às condições climáticas e de pista no momento do evento</li>
                      <li>🔧 A organização se reserva o direito de alterar modelos disponíveis em caso de imprevistos mecânicos ou logísticos</li>
                    </ul>
                  </div>
                  <div style="font-size: 0.95rem; color: #d32f2f; margin-top: 16px;">
                    <b>Atenção:</b> O ingresso é nominal e válido apenas com documento oficial.<br/>
                    Não compartilhe este e-mail. Dúvidas? Fale com a organização.
                  </div>
                </div>
                <div style="border-top: 1px solid #eee; margin: 32px 0 0 0; padding: 16px 32px 0 32px; text-align: center;">
                  <span style="font-size: 1rem; color: #222;">Siga o MotoFest:</span><br/>
                  <a href="https://wa.me/SEUNUMERO" style="display:inline-block; margin: 8px 12px 0 0;"><img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" style="height:28px; vertical-align:middle;" /></a>
                  <a href="https://instagram.com/SEUINSTAGRAM" style="display:inline-block; margin: 8px 0 0 0;"><img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="Instagram" style="height:28px; vertical-align:middle;" /></a>
                </div>
              </div>
            </div>
          `,
        });
        console.log("E-mail de confirmação enviado para:", cliente.email);
      } catch (e) {
        console.error("Erro ao enviar e-mail de confirmação:", e, e?.stack);
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
    console.log("Entrou no bloco payment_intent.succeeded");
    const paymentIntent = event.data.object;
    const metodoPagamento =
      paymentIntent.charges?.data?.[0]?.payment_method_details?.type || null;
    console.log("Webhook payment_intent.succeeded:", {
      paymentIntentId: paymentIntent.id,
      metodoPagamento,
      charges: paymentIntent.charges?.data?.length || 0,
    });
    try {
      const result = await prisma.pedido.updateMany({
        where: { paymentIntentId: paymentIntent.id },
        data: { metodoPagamento },
      });
      console.log("Pedidos atualizados via payment_intent.succeeded:", result);
    } catch (e) {
      console.error(
        "Erro ao atualizar metodoPagamento no payment_intent.succeeded:",
        e
      );
    }
  }

  if (event.type === "charge.succeeded") {
    console.log("Entrou no bloco charge.succeeded");
    const charge = event.data.object;
    const metodoPagamento = charge.payment_method_details?.type || null;
    const paymentIntentId = charge.payment_intent;
    console.log("Webhook charge.succeeded:", {
      paymentIntentId,
      metodoPagamento,
      chargeId: charge.id,
    });
    let updated = null;
    for (let i = 0; i < 3; i++) {
      try {
        updated = await prisma.pedido.updateMany({
          where: { paymentIntentId },
          data: { metodoPagamento },
        });
        if (updated.count > 0) {
          console.log("Pedidos atualizados via charge.succeeded:", updated);
          break;
        }
      } catch (e) {
        console.error(
          "Erro ao atualizar metodoPagamento no charge.succeeded:",
          e
        );
      }
      // Aguarda 2 segundos antes de tentar novamente
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    if (!updated || updated.count === 0) {
      console.log(
        "Nenhum pedido encontrado para atualizar via charge.succeeded"
      );
    }
  }

  return NextResponse.json({ received: true });
}
