import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/sendEmail";
import prisma from "@/lib/prisma";

export async function POST(req) {
  try {
    const { tipo, listaEmails } = await req.json();

    if (!tipo) {
      return NextResponse.json(
        { error: "Tipo de email é obrigatório" },
        { status: 400 }
      );
    }

    let clientes = [];

    if (listaEmails && Array.isArray(listaEmails) && listaEmails.length > 0) {
      // Usar lista específica de emails fornecida
      const emailsUnicos = [
        ...new Set(listaEmails.map((email) => email.trim())),
      ];
      clientes = emailsUnicos
        .map((email) => ({
          id: null,
          nome: "Cliente",
          email: email,
        }))
        .filter((cliente) => cliente.email && cliente.email.includes("@"));
    } else {
      // Buscar todos os clientes com email
      clientes = await prisma.cliente.findMany({
        where: {
          email: {
            not: null,
            not: "",
          },
        },
        select: {
          id: true,
          nome: true,
          email: true,
        },
      });
    }

    if (clientes.length === 0) {
      return NextResponse.json(
        { error: "Nenhum cliente com email válido encontrado" },
        { status: 400 }
      );
    }

    let subject, html;

    switch (tipo) {
      case "abertura-vendas":
        subject = "🎫 INGRESSOS SALÃO MOTO FEST - VENDAS ABERTAS!";
        html = `
          <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 0; margin: 0;">
            <div style="max-width: 520px; margin: 32px auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 12px #0002; padding: 0 0 32px 0; overflow: hidden;">
              <div style="background: #e3180a; padding: 32px 0 16px 0; text-align: center;">
                <img src="https://drive.google.com/uc?export=view&id=1MT9iMz0_1H5MuSSlvjfTwrDpnCfi5Xuj" alt="SalaoMotoFest" style="height: 56px; margin-bottom: 8px;" />
                <div style="color: #fff; font-size: 1.2rem; letter-spacing: 1px;">A sua experiência real começa aqui</div>
              </div>
              <div style="padding: 32px 32px 0 32px;">
                <div style="background: #e8f5e8; color: #2e7d32; border-radius: 6px; padding: 16px; margin-bottom: 24px; border: 1px solid #c8e6c9; text-align: center;">
                  <h2 style="color: #2e7d32; font-size: 1.4rem; margin: 0;">🎫 VENDAS ABERTAS!</h2>
                  <p style="font-size: 1.1rem; margin: 8px 0 0 0;">Os ingressos para o Salão Moto Fest já estão disponíveis!</p>
                </div>
                
                <h2 style="color: #e3180a; font-size: 1.3rem; margin-bottom: 16px;">Prepare-se para viver uma experiência real!</h2>
                
                <div style="background: #fff3cd; color: #856404; border-radius: 6px; padding: 16px; margin: 24px 0; border: 1px solid #ffeeba;">
                  <h3 style="color: #856404; font-size: 1.1rem; margin-bottom: 8px;">📅 DATAS DO EVENTO</h3>
                  <p style="margin: 0; font-size: 1rem;">
                    <strong>31 de Outubro a 02 de Novembro de 2025</strong><br/>
                    Sexta, Sábado e Domingo
                  </p>
                </div>

                <div style="border-top: 2px solid #e3180a; margin: 24px 0 16px 0;"></div>
                <h3 style="color: #e3180a; font-size: 1.1rem; margin-bottom: 12px;">🚀 O QUE TE ESPERA</h3>
                <ul style="color: #222; font-size: 1rem; margin-bottom: 16px; padding-left: 20px;">
                  <li>🏍️ <strong>Test Ride:</strong> Experimente as melhores motos do mercado</li>
                  <li>🎪 <strong>Exposições:</strong> As principais marcas em um só lugar</li>
                  <li>🎵 <strong>Shows:</strong> Música ao vivo com grandes bandas</li>
                  <li>🏁 <strong>Pista Tarumã:</strong> A lendária pista para sua aventura</li>
                  <li>🌲 <strong>Pista Off-Road:</strong> Desafios para os aventureiros</li>
                  <li>⚡ <strong>Mobilidade Urbana:</strong> Tecnologia elétrica do futuro</li>
                </ul>

                <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 24px 0;">
                  <h3 style="color: #e3180a; font-size: 1.1rem; margin-bottom: 12px;">💰 VALORES DOS INGRESSOS</h3>
                  
                  <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span style="font-weight: bold;">Fest Pass:</span>
                    <span style="color: #e3180a; font-weight: bold;">R$ 40,00</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span style="font-weight: bold;">Trail Pass (Test Ride Off-Road):</span>
                    <span style="color: #e3180a; font-weight: bold;">a partir de R$ 50,00</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span style="font-weight: bold;">Ride Pass (Test Ride):</span>
                    <span style="color: #e3180a; font-weight: bold;">a partir de R$ 200,00</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-bottom: 0;">
                    <span style="font-weight: bold;">Sport Pass (Test Ride):</span>
                    <span style="color: #e3180a; font-weight: bold;">a partir de R$ 300,00</span>
                  </div>
                </div>

                <div style="text-align: center; margin: 32px 0;">
                  <a href="https://salaomotofest.com.br/ingressos" style="display: inline-block; background: #e3180a; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 1.1rem; text-transform: uppercase;">
                    🎫 COMPRAR INGRESSOS AGORA
                  </a>
                </div>

                <div style="border-top: 1px solid #eee; margin: 32px 0 0 0; padding: 16px 32px 0 32px; text-align: center;">
                  <span style="font-size: 1rem; color: #222;">Siga o Salão Moto Fest:</span><br/>
                  <a href="https://wa.me/5551992485757" style="display:inline-block; margin: 8px 12px 0 0;"><img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg.png" alt="WhatsApp" style="height:28px; vertical-align:middle;" /></a>
                  <a href="https://instagram.com/salaodemotos" style="display:inline-block; margin: 8px 0 0 0;"><img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="Instagram" style="height:28px; vertical-align:middle;" /></a>
                </div>
              </div>
            </div>
          </div>
        `;
        break;

      case "confirmacao":
        subject = "Seu pedido MotoFest foi confirmado!";
        html = `
          <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 0; margin: 0;">
            <div style="max-width: 520px; margin: 32px auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 12px #0002; padding: 0 0 32px 0; overflow: hidden;">
              <div style="background: #d32f2f; padding: 32px 0 16px 0; text-align: center;">
                <img src="https://drive.google.com/uc?export=view&id=1MT9iMz0_1H5MuSSlvjfTwrDpnCfi5Xuj" alt="MotoFest" style="height: 56px; margin-bottom: 8px;" />
                <div style="color: #fff; font-size: 1.2rem; letter-spacing: 1px;">A sua experiência real começa aqui</div>
              </div>
              <div style="padding: 32px 32px 0 32px;">
                <h2 style="color: #d32f2f; font-size: 1.3rem; margin-bottom: 8px;">Olá!</h2>
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
                    <tr style="background:#fff; color:#222; text-align:center;">
                      <td style="padding:8px; border-bottom:1px solid #eee;">Honda CB 650R</td>
                      <td style="padding:8px; border-bottom:1px solid #eee;">Honda</td>
                      <td style="padding:8px; border-bottom:1px solid #eee;">15/12/2024</td>
                      <td style="padding:8px; border-bottom:1px solid #eee;">14:00</td>
                    </tr>
                  </tbody>
                </table>
                <div style="margin-bottom: 12px;">
                  <b>Total:</b> R$ 50,00<br/>
                  <b>Status:</b> pago<br/>
                  <b>Método de pagamento:</b> PIX
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
        `;
        break;

      case "cancelamento":
        subject = "Seu pedido MotoFest foi cancelado";
        html = `
          <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 0; margin: 0;">
            <div style="max-width: 520px; margin: 32px auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 12px #0002; padding: 0 0 32px 0; overflow: hidden;">
              <div style="background: #d32f2f; padding: 32px 0 16px 0; text-align: center;">
                <img src="https://drive.google.com/uc?export=view&id=1MT9iMz0_1H5MuSSlvjfTwrDpnCfi5Xuj" alt="MotoFest" style="height: 56px; margin-bottom: 8px;" />
                <div style="color: #fff; font-size: 1.2rem; letter-spacing: 1px;">A sua experiência real começa aqui</div>
              </div>
              <div style="padding: 32px 32px 0 32px;">
                <h2 style="color: #d32f2f; font-size: 1.3rem; margin-bottom: 8px;">Olá!</h2>
                <p style="font-size: 1.1rem; color: #222; margin-bottom: 16px;">Seu pedido foi <span style="color:#d32f2f; font-weight:bold;">cancelado</span> pela organização do evento.<br>Se tiver dúvidas, entre em contato conosco.</p>
                <div style="background: #fff3cd; color: #856404; border-radius: 6px; padding: 14px 18px; margin: 24px 0 16px 0; border: 1px solid #ffeeba; font-size: 1.05rem;">
                  <b>Reembolso:</b> Nossa equipe entrará em contato para combinar o reembolso do valor pago, conforme o método utilizado na compra.
                </div>
                <div style="border-top: 2px solid #d32f2f; margin: 24px 0 16px 0;"></div>
                <h3 style="color: #d32f2f; font-size: 1.1rem; margin-bottom: 8px;">Resumo do pedido cancelado</h3>
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
                    <tr style="background:#fff; color:#222; text-align:center;">
                      <td style="padding:8px; border-bottom:1px solid #eee;">Honda CB 650R</td>
                      <td style="padding:8px; border-bottom:1px solid #eee;">Honda</td>
                      <td style="padding:8px; border-bottom:1px solid #eee;">15/12/2024</td>
                      <td style="padding:8px; border-bottom:1px solid #eee;">14:00</td>
                    </tr>
                  </tbody>
                </table>
                <div style="margin-bottom: 12px;">
                  <b>Total:</b> R$ 50,00<br/>
                  <b>Status:</b> cancelado<br/>
                </div>
                <div style="margin: 32px 0 0 0; padding: 24px 24px 16px 24px; background: #f9f9f9; border-radius: 8px;">
                  <h3 style="color: #d32f2f; font-size: 1.1rem; margin-bottom: 10px;">Dúvidas?</h3>
                  <p style="color: #222; font-size: 1rem;">Entre em contato pelo WhatsApp ou Instagram:<br>
                    <a href="https://wa.me/SEUNUMERO" style="display:inline-block; margin: 8px 12px 0 0;"><img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" style="height:28px; vertical-align:middle;" /></a>
                    <a href="https://instagram.com/SEUINSTAGRAM" style="display:inline-block; margin: 8px 0 0 0;"><img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="Instagram" style="height:28px; vertical-align:middle;" /></a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        `;
        break;

      case "teste":
        subject = "Teste de Email - MotoFest";
        html = `
          <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 0; margin: 0;">
            <div style="max-width: 520px; margin: 32px auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 12px #0002; padding: 32px; text-align: center;">
              <div style="background: #d32f2f; padding: 32px 0 16px 0; text-align: center; margin: -32px -32px 32px -32px; border-radius: 10px 10px 0 0;">
                <img src="https://drive.google.com/uc?export=view&id=1MT9iMz0_1H5MuSSlvjfTwrDpnCfi5Xuj" alt="MotoFest" style="height: 56px; margin-bottom: 8px;" />
                <div style="color: #fff; font-size: 1.2rem; letter-spacing: 1px;">A sua experiência real começa aqui</div>
              </div>
              <h2 style="color: #d32f2f; font-size: 1.5rem; margin-bottom: 16px;">🧪 Teste de Email</h2>
              <p style="font-size: 1.1rem; color: #222; margin-bottom: 16px;">
                Este é um email de teste para verificar se a configuração de envio está funcionando corretamente.
              </p>
              <div style="background: #e8f5e8; color: #2e7d32; border-radius: 6px; padding: 16px; margin: 24px 0; border: 1px solid #c8e6c9;">
                ✅ <strong>Email enviado com sucesso!</strong><br/>
                Data e hora: ${new Date().toLocaleString("pt-BR")}
              </div>
              <p style="font-size: 0.9rem; color: #666;">
                Se você recebeu este email, significa que a configuração de envio está funcionando corretamente.
              </p>
            </div>
          </div>
        `;
        break;

      default:
        return NextResponse.json(
          { error: "Tipo de email inválido" },
          { status: 400 }
        );
    }

    // Log para debug
    console.log(
      `Processando ${clientes.length} emails:`,
      clientes.map((c) => c.email)
    );

    // Enviar emails para todos os clientes com delay
    const results = [];
    for (const cliente of clientes) {
      try {
        console.log(`Enviando email para: ${cliente.email}`);
        await sendEmail({
          to: cliente.email,
          subject,
          html,
        });
        console.log(`✅ Email enviado com sucesso para: ${cliente.email}`);
        results.push({ success: true, email: cliente.email });

        // Pequeno delay entre envios para evitar rate limiting
        if (clientes.length > 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`❌ Erro ao enviar email para ${cliente.email}:`, error);
        results.push({ error: true, email: cliente.email });
      }
    }
    const sucessos = results.filter((result) => result.success).length;
    const erros = results.filter((result) => result.error).length;

    console.log(`Resultado final: ${sucessos} sucessos, ${erros} erros`);

    return NextResponse.json({
      success: true,
      message: `Emails enviados com sucesso`,
      quantidade: sucessos,
      total: clientes.length,
      erros: erros,
    });
  } catch (error) {
    console.error("Erro ao enviar emails em lote:", error);
    return NextResponse.json(
      { error: "Erro ao enviar emails em lote" },
      { status: 500 }
    );
  }
}
