import { NextResponse } from "next/server";
import axios from "axios";
import prisma from "@/lib/prisma";
import { getEventoAtivo } from "@/lib/getEventoAtivo";
import { sendEmail } from "@/lib/sendEmail";

export const runtime = "nodejs";

// Função para verificar se o pagamento foi realmente aprovado
function verificarPagamentoAprovado(order) {
  // Verificar se o pedido está pago
  if (order.status !== "paid") {
    return false;
  }

  return true;
}

export async function POST(req) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-hub-signature");

    // Verificar assinatura do webhook (implementar se necessário)
    // if (!verifySignature(body, signature)) {
    //   return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
    // }

    const data = JSON.parse(body);
    console.log("=== WEBHOOK PAGAR.ME RECEBIDO ===");
    console.log("URL:", req.url);
    console.log("Method:", req.method);
    console.log("Headers:", Object.fromEntries(req.headers.entries()));
    console.log("Body:", data);
    console.log("===================================");

    // Processar eventos de pagamento
    console.log("Tipo de evento recebido:", data.type);

    // Processar eventos de pagamento
    if (data.type === "order.paid") {
      const order = data.data;
      console.log("Pedido encontrado:", order.id);
      console.log("Status do pedido:", order.status);
      console.log("Metadata do pedido:", order.metadata);
      console.log("Charges do pedido:", order.charges);
      console.log("Dados completos do pedido:", JSON.stringify(order, null, 2));

      // VALIDAÇÃO: Verificar se o pagamento foi realmente aprovado
      if (!verificarPagamentoAprovado(order)) {
        console.log("❌ Pagamento não foi aprovado. Status:", order.status);
        return NextResponse.json({
          error: "Pagamento não aprovado",
          status: order.status,
        });
      }

      console.log("✅ Pagamento aprovado - processando pedido");

      // Como o metadata não está chegando, vamos usar os dados do cliente do webhook
      const codigoPedido = `SMF#${Math.floor(Math.random() * 9000) + 1000}`;
      console.log("Gerando novo código de pedido:", codigoPedido);

      let pedido = await prisma.pedido.findFirst({
        where: {
          codigo: codigoPedido,
        },
        include: {
          agendamentos: true,
          evento: true,
        },
      });

      // Se o pedido não existe, criar agora
      if (!pedido) {
        // Normalizar e formatar CPF no padrão do banco (XXX.XXX.XXX-XX)
        const cpfSemFormatacao = order.customer.document.replace(/\D/g, "");
        const cpfFormatado = cpfSemFormatacao.replace(
          /(\d{3})(\d{3})(\d{3})(\d{2})/,
          "$1.$2.$3-$4"
        );

        // Buscar cliente APENAS por CPF formatado
        let cliente = await prisma.cliente.findUnique({
          where: { cpf: cpfFormatado },
        });

        if (!cliente) {
          cliente = await prisma.cliente.create({
            data: {
              nome: order.customer.name,
              email: order.customer.email,
              cpf: cpfFormatado,
              cnh: "PENDENTE", // Será atualizado depois
              telefone: `${order.customer.phones.mobile_phone.area_code}${order.customer.phones.mobile_phone.number}`,
            },
          });
          console.log("Cliente criado:", cliente.id);
        } else {
          console.log("Cliente encontrado:", cliente.id);
        }

        // Determinar método de pagamento baseado na charge
        let metodoPagamento = "PAGARME";
        if (order.charges && order.charges.length > 0) {
          const charge = order.charges[0];
          if (charge.payment_method === "credit_card") {
            metodoPagamento = "CARD";
          } else if (charge.payment_method === "pix") {
            metodoPagamento = "PIX";
          }
        }

        // Criar pedido usando dados do webhook
        pedido = await prisma.pedido.create({
          data: {
            clienteId: cliente.id,
            eventoId: 3, // Evento fixo por enquanto
            valor: order.amount / 100, // Converter de centavos para reais
            status: "pago",
            codigo: codigoPedido,
            metodoPagamento: metodoPagamento,
            paymentIntentId: order.id,
            createdAt: new Date(),
          },
          include: {
            agendamentos: true,
            evento: true,
          },
        });

        // Atualizar o código do pedido para 1000 + ID
        const codigoFinal = `SMF#${1000 + pedido.id}`;
        await prisma.pedido.update({
          where: { id: pedido.id },
          data: { codigo: codigoFinal },
        });
        pedido.codigo = codigoFinal;

        // Criar agendamentos baseado nos metadados do pedido
        const evento = await getEventoAtivo();
        if (evento) {
          console.log("Itens do carrinho:", order.items);
          console.log("Metadata do pedido:", order.metadata);

          // Tentar buscar dados do metadata ou buscar do link de pagamento
          let agendamentoData = [];

          if (order.metadata?.agendamento) {
            try {
              agendamentoData = JSON.parse(order.metadata.agendamento);
              console.log(
                "Dados do agendamento extraídos do metadata:",
                agendamentoData
              );
            } catch (e) {
              console.error("Erro ao parsear metadata do agendamento:", e);
            }
          } else {
            // Se não tem metadata, tentar buscar do link de pagamento
            console.log(
              "Metadata não encontrado, tentando buscar do link de pagamento..."
            );
            console.log("Order code:", order.code);
            console.log("Order integration code:", order.integration?.code);

            try {
              // Tentar com order.code primeiro
              let linkId = order.code;
              console.log("Tentando buscar link com ID:", linkId);

              const pagarmeApiUrl =
                process.env.PAGARME_API_URL ||
                "https://sdx-api.pagar.me/core/v5/paymentlinks";
              const linkResponse = await axios.get(
                `${pagarmeApiUrl}/${linkId}`,
                {
                  headers: {
                    Authorization: `Basic ${Buffer.from(process.env.PAGARME_API_KEY + ":").toString("base64")}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              const linkData = linkResponse.data;
              console.log("Dados do link encontrados:", linkData.metadata);

              if (linkData.metadata?.agendamento) {
                agendamentoData = JSON.parse(linkData.metadata.agendamento);
                console.log(
                  "Dados do agendamento extraídos do link:",
                  agendamentoData
                );
              } else {
                console.log("Metadata do link também não encontrado");
              }
            } catch (e) {
              console.error("Erro ao buscar dados do link:", e);
              console.error("Detalhes do erro:", e.response?.data);
            }

            // Se ainda não temos dados, tentar extrair da descrição do item
            if (
              agendamentoData.length === 0 &&
              order.items &&
              order.items.length > 0
            ) {
              console.log("Tentando extrair dados da descrição do item...");
              const itemDescription = order.items[0].description;
              console.log("Descrição do item:", itemDescription);

              // Se a descrição está truncada, tentar buscar do link de pagamento
              if (itemDescription.length < 50) {
                console.log(
                  "Descrição truncada, tentando buscar descrição completa do link..."
                );
                try {
                  const pagarmeApiUrl =
                    process.env.PAGARME_API_URL ||
                    "https://sdx-api.pagar.me/core/v5/paymentlinks";
                  const linkResponse = await axios.get(
                    `${pagarmeApiUrl}/${order.code}`,
                    {
                      headers: {
                        Authorization: `Basic ${Buffer.from(process.env.PAGARME_API_KEY + ":").toString("base64")}`,
                        "Content-Type": "application/json",
                      },
                    }
                  );

                  const linkData = linkResponse.data;
                  console.log(
                    "Dados do link encontrados:",
                    linkData.cart_settings?.items
                  );

                  if (
                    linkData.cart_settings?.items &&
                    linkData.cart_settings.items.length > 0
                  ) {
                    const fullDescription =
                      linkData.cart_settings.items[0].description;
                    console.log("Descrição completa do link:", fullDescription);

                    // Extrair dados da descrição completa
                    const motosMatch = fullDescription.match(
                      /Moto (\d+): ([^,]+), Data: ([^,]+), Horário: ([^|]+)/g
                    );

                    if (motosMatch) {
                      console.log(
                        "Motos encontradas na descrição completa:",
                        motosMatch.length
                      );

                      for (const motoMatch of motosMatch) {
                        const match = motoMatch.match(
                          /Moto (\d+): ([^,]+), Data: ([^,]+), Horário: (.+)/
                        );
                        if (match) {
                          const [, numero, modelo, data, horario] = match;
                          console.log(
                            `Extraído: Moto ${numero} - ${modelo} - ${data} - ${horario}`
                          );

                          // Buscar moto pelo nome
                          const moto = await prisma.moto.findFirst({
                            where: {
                              nome: { contains: modelo.trim() },
                            },
                          });

                          // Buscar horário pelo horário
                          const horarioObj = await prisma.horario.findFirst({
                            where: {
                              hora: horario.trim(),
                              eventoId: evento.id,
                            },
                          });

                          if (moto && horarioObj) {
                            // Converter data de DD/MM/YYYY para Date (formato ISO)
                            const [day, month, year] = data.trim().split("/");
                            // Criar data no formato YYYY-MM-DD para evitar problemas de fuso horário
                            const dataISO = `${parseInt(year)}-${parseInt(month).toString().padStart(2, "0")}-${parseInt(day).toString().padStart(2, "0")}`;
                            const dataObj = new Date(
                              dataISO + "T00:00:00.000Z"
                            );

                            agendamentoData.push({
                              motoId: moto.id.toString(),
                              horarioId: horarioObj.id.toString(),
                              modelo: moto.nome || moto.modelo,
                              horario: horarioObj.hora,
                              data: dataObj,
                            });
                            console.log(
                              `Agendamento preparado para: ${moto.nome || moto.modelo} - ${horarioObj.hora} - ${dataISO}`
                            );
                          } else {
                            console.log(
                              `Não foi possível encontrar moto ou horário para: ${modelo} - ${horario}`
                            );
                            console.log("Moto encontrada:", !!moto);
                            console.log("Horário encontrado:", !!horarioObj);
                          }
                        }
                      }
                    } else {
                      console.log(
                        "Nenhuma moto encontrada na descrição completa do link"
                      );
                    }
                  }
                } catch (e) {
                  console.error(
                    "Erro ao buscar descrição completa do link:",
                    e
                  );
                }
              } else {
                // Tentar extrair da descrição do item (método anterior)
                const motosMatch = itemDescription.match(
                  /Moto (\d+): ([^,]+), Data: ([^,]+), Horário: ([^|]+)/g
                );

                if (motosMatch) {
                  console.log(
                    "Motos encontradas na descrição:",
                    motosMatch.length
                  );

                  for (const motoMatch of motosMatch) {
                    const match = motoMatch.match(
                      /Moto (\d+): ([^,]+), Data: ([^,]+), Horário: (.+)/
                    );
                    if (match) {
                      const [, numero, modelo, data, horario] = match;
                      console.log(
                        `Extraído: Moto ${numero} - ${modelo} - ${data} - ${horario}`
                      );

                      // Buscar moto pelo nome
                      const moto = await prisma.moto.findFirst({
                        where: {
                          nome: { contains: modelo.trim() },
                        },
                      });

                      // Buscar horário pelo horário
                      const horarioObj = await prisma.horario.findFirst({
                        where: {
                          hora: horario.trim(),
                          eventoId: evento.id,
                        },
                      });

                      if (moto && horarioObj) {
                        // Converter data de DD/MM/YYYY para Date (formato ISO)
                        const [day, month, year] = data.trim().split("/");
                        // Criar data no formato YYYY-MM-DD para evitar problemas de fuso horário
                        const dataISO = `${parseInt(year)}-${parseInt(month).toString().padStart(2, "0")}-${parseInt(day).toString().padStart(2, "0")}`;
                        const dataObj = new Date(dataISO + "T00:00:00.000Z");

                        agendamentoData.push({
                          motoId: moto.id.toString(),
                          horarioId: horarioObj.id.toString(),
                          modelo: moto.nome || moto.modelo,
                          horario: horarioObj.hora,
                          data: dataObj,
                        });
                        console.log(
                          `Agendamento preparado para: ${moto.nome || moto.modelo} - ${horarioObj.hora} - ${dataISO}`
                        );
                      } else {
                        console.log(
                          `Não foi possível encontrar moto ou horário para: ${modelo} - ${horario}`
                        );
                        console.log("Moto encontrada:", !!moto);
                        console.log("Horário encontrado:", !!horarioObj);
                      }
                    }
                  }
                } else {
                  console.log("Nenhuma moto encontrada na descrição do item");
                }
              }
            }
          }

          if (agendamentoData.length > 0) {
            // Criar agendamentos para cada moto do metadata
            for (const motoData of agendamentoData) {
              console.log("Processando moto do metadata:", motoData);

              // Buscar moto pelo ID
              const moto = await prisma.moto.findUnique({
                where: { id: parseInt(motoData.motoId) },
              });

              // Buscar horário pelo ID
              const horario = await prisma.horario.findUnique({
                where: { id: parseInt(motoData.horarioId) },
              });

              // Buscar ingresso do evento
              const ingresso = await prisma.ingresso.findFirst({
                where: {
                  eventoId: evento.id,
                },
              });

              if (moto && horario && ingresso) {
                // Converter data de DD/MM/YYYY para Date
                let dataAgendamento = new Date();
                if (motoData.data) {
                  if (
                    typeof motoData.data === "string" &&
                    motoData.data.includes("/")
                  ) {
                    // Formato DD/MM/YYYY
                    const [day, month, year] = motoData.data.split("/");
                    const dataISO = `${parseInt(year)}-${parseInt(month).toString().padStart(2, "0")}-${parseInt(day).toString().padStart(2, "0")}`;
                    dataAgendamento = new Date(dataISO + "T00:00:00.000Z");
                  } else if (motoData.data instanceof Date) {
                    dataAgendamento = motoData.data;
                  }
                }

                await prisma.agendamento.create({
                  data: {
                    pedidoId: pedido.id,
                    horarioId: horario.id,
                    clienteId: cliente.id,
                    ingressoId: ingresso.id,
                    motoId: moto.id,
                    eventoId: evento.id,
                    data: dataAgendamento,
                    codigo: `AGEND#${Math.floor(Math.random() * 9000) + 1000}`,
                    status: "pago",
                  },
                });
                console.log(
                  `Agendamento criado para: ${motoData.modelo} - ${motoData.horario} - ${dataAgendamento.toISOString().split("T")[0]}`
                );
              } else {
                console.log(
                  `Não foi possível criar agendamento para: ${motoData.modelo}`
                );
                console.log("Moto encontrada:", !!moto);
                console.log("Horário encontrado:", !!horario);
                console.log("Ingresso encontrado:", !!ingresso);
              }
            }
          } else {
            // Fallback: criar agendamentos genéricos
            console.log("Usando fallback para criar agendamentos genéricos");
            const quantidadeMotos = parseInt(order.metadata?.quantidade || "1");

            const horariosDisponiveis = await prisma.horario.findMany({
              where: {
                eventoId: evento.id,
                agendamentos: { none: {} },
              },
              take: quantidadeMotos,
            });

            const motosDisponiveis = await prisma.moto.findMany({
              where: {
                ingresso: { eventoId: evento.id },
              },
              take: quantidadeMotos,
            });

            const ingresso = await prisma.ingresso.findFirst({
              where: { eventoId: evento.id },
            });

            for (
              let i = 0;
              i < quantidadeMotos &&
              i < horariosDisponiveis.length &&
              i < motosDisponiveis.length;
              i++
            ) {
              const horario = horariosDisponiveis[i];
              const moto = motosDisponiveis[i];

              if (horario && moto && ingresso) {
                await prisma.agendamento.create({
                  data: {
                    pedidoId: pedido.id,
                    horarioId: horario.id,
                    clienteId: cliente.id,
                    ingressoId: ingresso.id,
                    motoId: moto.id,
                    eventoId: evento.id,
                    data: new Date(),
                    codigo: `AGEND#${Math.floor(Math.random() * 9000) + 1000}`,
                    status: "pago",
                  },
                });
                console.log(
                  `Agendamento genérico criado para moto ${i + 1}: ${moto.nome || moto.modelo}`
                );
              }
            }
          }
        }

        // Buscar agendamentos completos para o e-mail
        let agendamentosCompletos = [];
        try {
          agendamentosCompletos = await prisma.agendamento.findMany({
            where: { pedidoId: pedido.id },
            include: {
              moto: { include: { marca: true } },
              horario: true,
            },
          });
        } catch (e) {
          console.error(
            "Erro ao buscar agendamentos completos para e-mail:",
            e
          );
        }

        // Enviar email de confirmação
        console.log("Tentando enviar email para:", order.customer.email);
        try {
          await sendEmail({
            to: order.customer.email,
            subject: `Você vai pilotar no Salão Moto Fest! Prepare-se para o grande dia [${pedido.codigo}]`,
            html: `
              <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 0; margin: 0;">
                <div style="max-width: 520px; margin: 32px auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 12px #0002; padding: 0 0 32px 0; overflow: hidden;">
                  <div style="background: #e3180a; padding: 32px 0 16px 0; text-align: center;">
                    <img src="https://drive.google.com/uc?export=view&id=1MT9iMz0_1H5MuSSlvjfTwrDpnCfi5Xuj" alt="MotoFest" style="height: 56px; margin-bottom: 8px;" />
                    <div style="color: #fff; font-size: 1.2rem; letter-spacing: 1px;">A sua experiência real começa aqui</div>
                  </div>
                  <div style="padding: 32px 32px 0 32px;">
                    <h2 style="color: #e3180a; font-size: 1.3rem; margin-bottom: 8px;">Olá, <b>${order.customer.name}</b>!</h2>
                    <p style="font-size: 1.1rem; color: #222; margin-bottom: 16px;">Sua compra para o Salão Moto Fest foi realizada com sucesso!<br>Leve este e-mail e seu documento no dia do evento.</p>
                    <div style="border-top: 2px solid #e3180a; margin: 24px 0 16px 0;"></div>
                    <h3 style="color: #e3180a; font-size: 1.1rem; margin-bottom: 8px;">Resumo da compra</h3>
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
                      <b>Total:</b> R$ ${(order.amount / 100).toFixed(2)}<br/>
                      <b>Status:</b> ${pedido.status}<br/>
                      <b>Código do pedido:</b> ${pedido.codigo}<br/>
                      <b>Método de pagamento:</b> ${pedido.metodoPagamento ? pedido.metodoPagamento.toUpperCase() : "-"}
                    </div>
                    
                    <div style="margin: 32px 0 0 0; padding: 24px 24px 16px 24px; background: #f9f9f9; border-radius: 8px;">
                      <h3 style="color: #e3180a; font-size: 1.1rem; margin-bottom: 10px;">O que levar no dia do evento</h3>
                      <ul style="color: #222; font-size: 1rem; margin-bottom: 16px; padding-left: 20px;">
                        <li>✔️ Este e-mail de confirmação (impresso ou no celular)</li>
                        <li>✔️ Documento oficial com foto (RG ou CNH)</li>
                        <li>✔️ CNH válida – categoria A</li>
                        <li>✔️ Equipamentos de segurança obrigatórios:<br>
                          &nbsp;&nbsp;- Capacete fechado<br>
                          &nbsp;&nbsp;- Jaqueta de manga longa<br>
                          &nbsp;&nbsp;- Calça comprida (jeans,couro ou cordura)<br>
                          &nbsp;&nbsp;- Calçado fechado<br>
                          &nbsp;&nbsp;- Luvas (recomendado)
                        </li>
                      </ul>
                      <div style="color: #e3180a; font-size: 0.98rem; margin-bottom: 10px;">
                        ⚠️ <strong>NÃO SÃO ACEITOS:</strong> capacete aberto, roupas de moletom, corta vento, legging e jeans desfiado ou com aberturas. A falta de qualquer equipamento impedirá a participação no Test Ride.
                      </div>
                      <h3 style="color: #e3180a; font-size: 1.1rem; margin-bottom: 10px;">Termos de participação</h3>
                      <ul style="color: #222; font-size: 1rem; margin-bottom: 0; padding-left: 20px;">
                        <li>📄 O ingresso é nominal e intransferível</li>
                        <li>⏰ Chegue com no mínimo 1 hora de antecedência do seu horário agendado</li>
                        <li>❗ Em caso de atraso ou ausência, o agendamento poderá ser cancelado sem reembolso</li>
                        <li>🌧️ O test ride está sujeito às condições climáticas e de pista no momento do evento</li>
                        <li>🔧 A organização se reserva o direito de alterar modelos disponíveis em caso de imprevistos mecânicos ou logísticos</li>
                        <li>🚫 Não será tolerado o consumo de bebida alcoólica ou substâncias ilícitas</li>
                        <li>📋 A participação no briefing é obrigatória</li>
                        <li>🛡️ O participante deve seguir todas as regras de segurança e conduta dos instrutores</li>
                      </ul>
                    </div>
                    <div style="font-size: 0.95rem; color: #e3180a; margin-top: 16px;">
                      <b>Atenção:</b> O ingresso é nominal e válido apenas com documento oficial.<br/>
                      Não compartilhe este e-mail. Dúvidas? Fale com a organização.
                    </div>
                  </div>
                  <div style="border-top: 1px solid #eee; margin: 32px 0 0 0; padding: 16px 32px 0 32px; text-align: center;">
                    <span style="font-size: 1rem; color: #222;">Siga o MotoFest:</span><br/>
                    <a href="https://wa.me/5551992485757" style="display:inline-block; margin: 8px 12px 0 0;"><img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg.png" alt="WhatsApp" style="height:28px; vertical-align:middle;" /></a>
                    <a href="https://instagram.com/salaodemotos" style="display:inline-block; margin: 8px 0 0 0;"><img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="Instagram" style="height:28px; vertical-align:middle;" /></a>
                  </div>
                </div>
              </div>
            `,
          });

          console.log("Email enviado com sucesso!");
        } catch (emailError) {
          console.error("Erro ao enviar email:", emailError);
        }

        // Enviar webhook para Discord (PEDIDO CONFIRMADO)
        try {
          // Buscar agendamentos completos para o e-mail
          let agendamentosCompletos = [];
          try {
            agendamentosCompletos = await prisma.agendamento.findMany({
              where: { pedidoId: pedido.id },
              include: {
                moto: { include: { marca: true } },
                horario: true,
              },
            });
          } catch (e) {
            console.error(
              "Erro ao buscar agendamentos completos para e-mail:",
              e
            );
          }

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
                    value: order.customer.name,
                    inline: true,
                  },
                  {
                    id: 531816709,
                    name: "CPF",
                    value: order.customer.document.replace(
                      /(\d{3})(\d{3})(\d{3})(\d{2})/,
                      "$1.$2.$3-$4"
                    ),
                  },
                  {
                    id: 980485366,
                    name: "E-mail",
                    value: order.customer.email,
                  },
                  {
                    id: 104269543,
                    name: "Telefone",
                    value: `(${order.customer.phones.mobile_phone.area_code}) ${order.customer.phones.mobile_phone.number.replace(/(\d{4})(\d{4})/, "$1-$2")}\n[Whatsapp](<https://wa.me/55${order.customer.phones.mobile_phone.area_code}${order.customer.phones.mobile_phone.number}>)`,
                  },
                  { id: 979321908, name: "Motos", value: motosString },
                  {
                    id: 123456789,
                    name: "Tipo de Ingresso",
                    value: order.metadata?.tipo || "Ingresso",
                  },
                  {
                    id: 987654321,
                    name: "Valor",
                    value: `R$ ${(order.amount / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
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
            await fetch(discordWebhookUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(discordPayload),
            });
          }
        } catch (err) {
          console.error("Erro ao enviar webhook para Discord:", err);
        }

        console.log("Pedido criado com sucesso:", pedido.id);
      } else {
        console.log("Pedido já existe:", pedido.id);
      }
    } else if (data.type === "order.payment_failed") {
      // Log do evento de falha de pagamento
      const order = data.data;
      console.log("❌ EVENTO DE FALHA DE PAGAMENTO RECEBIDO");
      console.log("Pedido ID:", order.id);
      console.log("Status do pedido:", order.status);
      console.log("NÃO PROCESSANDO - Pagamento falhou");

      // Enviar webhook para Discord (FALHA DE PAGAMENTO)
      try {
        const discordPayload = {
          content: "",
          tts: false,
          embeds: [
            {
              title: "❌ FALHA DE PAGAMENTO",
              color: 15158332, // Vermelho
              timestamp: new Date().toISOString(),
              fields: [
                {
                  name: "Nome",
                  value: order.customer?.name || "N/A",
                  inline: true,
                },
                {
                  name: "CPF",
                  value: order.customer?.document
                    ? order.customer.document.replace(
                        /(\d{3})(\d{3})(\d{3})(\d{2})/,
                        "$1.$2.$3-$4"
                      )
                    : "N/A",
                },
                {
                  name: "E-mail",
                  value: order.customer?.email || "N/A",
                },
                {
                  name: "Valor",
                  value: `R$ ${(order.amount / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
                },
                {
                  name: "Status",
                  value: order.status,
                },
                {
                  name: "Status do Pedido",
                  value: order.status || "N/A",
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
          await fetch(discordWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(discordPayload),
          });
        }
      } catch (err) {
        console.error("Erro ao enviar webhook de falha para Discord:", err);
      }
    } else if (data.type === "order.canceled") {
      // Log do evento de cancelamento
      const order = data.data;
      console.log("❌ EVENTO DE CANCELAMENTO RECEBIDO");
      console.log("Pedido ID:", order.id);
      console.log("Status do pedido:", order.status);
      console.log("NÃO PROCESSANDO - Pedido cancelado");
    } else if (data.type === "order.created") {
      // Log do evento de criação
      const order = data.data;
      console.log("📝 EVENTO DE CRIAÇÃO RECEBIDO");
      console.log("Pedido ID:", order.id);
      console.log("Status do pedido:", order.status);
      console.log("NÃO PROCESSANDO - Pedido criado (aguardando pagamento)");
    } else if (data.type === "order.updated") {
      // Log do evento de atualização
      const order = data.data;
      console.log("🔄 EVENTO DE ATUALIZAÇÃO RECEBIDO");
      console.log("Pedido ID:", order.id);
      console.log("Status do pedido:", order.status);
      console.log("NÃO PROCESSANDO - Pedido atualizado");
    } else if (data.type === "order.closed") {
      // Log do evento de fechamento
      const order = data.data;
      console.log("🔒 EVENTO DE FECHAMENTO RECEBIDO");
      console.log("Pedido ID:", order.id);
      console.log("Status do pedido:", order.status);
      console.log("NÃO PROCESSANDO - Pedido fechado");
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Erro ao processar webhook:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
