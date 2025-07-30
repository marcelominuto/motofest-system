import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getEventoAtivo } from "@/lib/getEventoAtivo";
import { sendEmail } from "@/lib/sendEmail";

// PUT: Atualizar status do pedido
export async function PUT(req, context) {
  const params = await context.params;
  const { id } = await params;
  const { status } = await req.json();

  if (!status) {
    return NextResponse.json(
      { error: "Status é obrigatório" },
      { status: 400 }
    );
  }

  try {
    const evento = await getEventoAtivo();
    if (!evento) {
      return NextResponse.json(
        { error: "Nenhum evento ativo encontrado" },
        { status: 404 }
      );
    }

    // Busca o pedido
    const pedido = await prisma.pedido.findUnique({
      where: { id: parseInt(id) },
      include: { agendamentos: true },
    });

    if (!pedido || pedido.eventoId !== evento.id) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    // Atualiza o pedido e os agendamentos vinculados em uma transação
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Atualiza o status do pedido
      const pedidoAtualizado = await tx.pedido.update({
        where: { id: parseInt(id) },
        data: { status },
      });

      // 2. Atualiza o status dos agendamentos vinculados
      if (pedido.agendamentos.length > 0) {
        await tx.agendamento.updateMany({
          where: { pedidoId: parseInt(id) },
          data: {
            status: status === "pago" ? "pago" : "pendente",
          },
        });
      }

      return pedidoAtualizado;
    });

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("PUT /api/pedidos/[id] error:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar pedido" },
      { status: 500 }
    );
  }
}

// GET: Buscar pedido específico
export async function GET(req, context) {
  const params = await context.params;
  const { id } = await params;

  try {
    const evento = await getEventoAtivo();
    if (!evento) {
      return NextResponse.json(
        { error: "Nenhum evento ativo encontrado" },
        { status: 404 }
      );
    }

    const pedido = await prisma.pedido.findUnique({
      where: { id: parseInt(id) },
      include: {
        cliente: true,
        agendamentos: {
          include: {
            moto: { include: { marca: true } },
            horario: true,
            ingresso: true,
          },
        },
      },
    });

    if (!pedido || pedido.eventoId !== evento.id) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(pedido);
  } catch (error) {
    console.error("GET /api/pedidos/[id] error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pedido" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, context) {
  const params = await context.params;
  const { id } = params;
  if (!id)
    return NextResponse.json(
      { error: "ID do pedido não informado" },
      { status: 400 }
    );
  try {
    // Buscar pedido completo antes de cancelar
    const pedido = await prisma.pedido.findUnique({
      where: { id: parseInt(id, 10) },
      include: {
        cliente: true,
        agendamentos: {
          include: {
            moto: { include: { marca: true } },
            horario: true,
            ingresso: true,
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
    // Enviar e-mail de cancelamento
    try {
      await sendEmail({
        to: pedido.cliente.email,
        subject: `Seu pedido MotoFest foi cancelado [${pedido.codigo}]`,
        html: `
          <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 0; margin: 0;">
            <div style="max-width: 520px; margin: 32px auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 12px #0002; padding: 0 0 32px 0; overflow: hidden;">
              <div style="background: #d32f2f; padding: 32px 0 16px 0; text-align: center;">
                <img src="https://drive.google.com/uc?export=view&id=1MT9iMz0_1H5MuSSlvjfTwrDpnCfi5Xuj" alt="MotoFest" style="height: 56px; margin-bottom: 8px;" />
                <div style="color: #fff; font-size: 1.2rem; letter-spacing: 1px;">A sua experiência real começa aqui</div>
              </div>
              <div style="padding: 32px 32px 0 32px;">
                <h2 style="color: #d32f2f; font-size: 1.3rem; margin-bottom: 8px;">Olá, <b>${pedido.cliente.nome}</b>!</h2>
                <p style="font-size: 1.1rem; color: #222; margin-bottom: 16px;">Seu pedido <b>${pedido.codigo}</b> foi <span style="color:#d32f2f; font-weight:bold;">cancelado</span> pela organização do evento.<br>Se tiver dúvidas, entre em contato conosco.</p>
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
                    ${pedido.agendamentos
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
                  <b>Total:</b> R$ ${pedido.valor}<br/>
                  <b>Status:</b> cancelado<br/>
                  <b>Código do pedido:</b> ${pedido.codigo}<br/>
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
          `,
      });
      console.log("E-mail de cancelamento enviado para:", pedido.cliente.email);
    } catch (e) {
      console.error("Erro ao enviar e-mail de cancelamento:", e, e?.stack);
    }
    // Exclui agendamentos vinculados
    await prisma.agendamento.deleteMany({
      where: { pedidoId: parseInt(id, 10) },
    });
    // Atualiza o status do pedido para cancelado
    await prisma.pedido.update({
      where: { id: parseInt(id, 10) },
      data: { status: "cancelado" },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Erro ao cancelar pedido:", error);
    return NextResponse.json(
      { error: "Erro ao cancelar pedido" },
      { status: 500 }
    );
  }
}
