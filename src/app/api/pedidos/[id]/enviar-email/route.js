import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(req, { params }) {
  try {
    const { id } = params;

    // Buscar pedido com dados completos
    const pedido = await prisma.pedido.findUnique({
      where: { id: parseInt(id) },
      include: {
        cliente: true,
        agendamentos: {
          include: {
            moto: { include: { marca: true } },
            horario: true,
          },
        },
      },
    });

    if (!pedido) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    if (!pedido.cliente?.email) {
      return NextResponse.json(
        { error: "Cliente não possui email cadastrado" },
        { status: 400 }
      );
    }

    // Gerar HTML do email
    const agendamentosCompletos = pedido.agendamentos || [];

    const emailHTML = `
      <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 0; margin: 0;">
        <div style="max-width: 520px; margin: 32px auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 12px #0002; padding: 0 0 32px 0; overflow: hidden;">
          <div style="background: #e3180a; padding: 32px 0 16px 0; text-align: center;">
            <img src="https://drive.google.com/uc?export=view&id=1MT9iMz0_1H5MuSSlvjfTwrDpnCfi5Xuj" alt="MotoFest" style="height: 56px; margin-bottom: 8px;" />
            <div style="color: #fff; font-size: 1.2rem; letter-spacing: 1px;">A sua experiência real começa aqui</div>
          </div>
          <div style="padding: 32px 32px 0 32px;">
            <h2 style="color: #e3180a; font-size: 1.3rem; margin-bottom: 8px;">Olá, <b>${pedido.cliente.nome}</b>!</h2>
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
                    const [year, month, day] = dataStr.split("T")[0].split("-");
                    const motoLabel = a.moto?.nome || a.modelo || "-";
                    const marcaLabel = a.moto?.marca?.nome || "-";
                    const horarioLabel = a.horario?.hora || a.horario || "-";
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
              <b>Total:</b> R$ ${Number(pedido.valor).toFixed(2)}<br/>
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
    `;

    // Enviar email
    await sendEmail({
      to: pedido.cliente.email,
      subject: `Você vai pilotar no Salão Moto Fest! Prepare-se para o grande dia [${pedido.codigo}]`,
      html: emailHTML,
    });

    return NextResponse.json({
      success: true,
      message: "Email enviado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return NextResponse.json(
      { error: "Erro ao enviar email" },
      { status: 500 }
    );
  }
}
