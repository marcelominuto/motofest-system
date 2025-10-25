import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getEventoAtivo } from "@/lib/getEventoAtivo";

// GET: Buscar disponibilidade detalhada
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const data = searchParams.get("data");
    const motoId = searchParams.get("motoId");
    const horarioId = searchParams.get("horarioId");

    if (!data) {
      return NextResponse.json(
        { error: "Parâmetro obrigatório: data" },
        { status: 400 }
      );
    }

    const evento = await getEventoAtivo();
    if (!evento) {
      return NextResponse.json(
        { error: "Nenhum evento ativo encontrado" },
        { status: 404 }
      );
    }

    const dataObj = new Date(data);

    if (motoId) {
      // Buscar disponibilidade de uma moto específica em todos os horários
      const moto = await prisma.moto.findUnique({
        where: { id: parseInt(motoId, 10) },
        include: { marca: true, ingresso: true },
      });

      if (!moto) {
        return NextResponse.json(
          { error: "Moto não encontrada" },
          { status: 404 }
        );
      }

      // Buscar todos os horários do evento
      const horarios = await prisma.horario.findMany({
        where: { eventoId: evento.id },
        orderBy: { hora: "asc" },
      });

      // Buscar agendamentos para esta moto nesta data
      const agendamentos = await prisma.agendamento.findMany({
        where: {
          motoId: parseInt(motoId, 10),
          data: dataObj,
          eventoId: evento.id,
        },
        include: { horario: true },
      });

      // Agrupar agendamentos por horário
      const agendamentosPorHorario = {};
      agendamentos.forEach((agendamento) => {
        const horarioId = agendamento.horarioId;
        if (!agendamentosPorHorario[horarioId]) {
          agendamentosPorHorario[horarioId] = 0;
        }
        agendamentosPorHorario[horarioId]++;
      });

      // Montar resultado
      const disponibilidade = horarios.map((horario) => {
        const agendados = agendamentosPorHorario[horario.id] || 0;
        const disponivel = moto.quantidade - agendados;

        return {
          horario: {
            id: horario.id,
            hora: horario.hora,
          },
          moto: {
            id: moto.id,
            nome: moto.nome,
            marca: moto.marca.nome,
            categoria: moto.categoria,
            quantidade: moto.quantidade,
            ingresso: moto.ingresso.tipo,
          },
          agendados,
          disponivel,
          esgotado: disponivel <= 0,
          baixoEstoque:
            disponivel > 0 && disponivel <= Math.ceil(moto.quantidade * 0.2), // 20% do estoque
        };
      });

      return NextResponse.json({
        tipo: "por-moto",
        data: dataObj.toISOString(),
        moto: {
          id: moto.id,
          nome: moto.nome,
          marca: moto.marca.nome,
          categoria: moto.categoria,
        },
        disponibilidade,
      });
    } else if (horarioId) {
      // Buscar disponibilidade de um horário específico para todas as motos
      const horario = await prisma.horario.findUnique({
        where: { id: parseInt(horarioId, 10) },
      });

      if (!horario) {
        return NextResponse.json(
          { error: "Horário não encontrado" },
          { status: 404 }
        );
      }

      // Buscar todas as motos do evento
      const motos = await prisma.moto.findMany({
        include: { marca: true, ingresso: true },
        orderBy: [{ marca: { nome: "asc" } }, { nome: "asc" }],
      });

      // Buscar agendamentos para este horário nesta data
      const agendamentos = await prisma.agendamento.findMany({
        where: {
          horarioId: parseInt(horarioId, 10),
          data: dataObj,
          eventoId: evento.id,
        },
        include: { moto: { include: { marca: true } } },
      });

      // Agrupar agendamentos por moto
      const agendamentosPorMoto = {};
      agendamentos.forEach((agendamento) => {
        const motoId = agendamento.motoId;
        if (!agendamentosPorMoto[motoId]) {
          agendamentosPorMoto[motoId] = 0;
        }
        agendamentosPorMoto[motoId]++;
      });

      // Montar resultado
      const disponibilidade = motos.map((moto) => {
        const agendados = agendamentosPorMoto[moto.id] || 0;
        const disponivel = moto.quantidade - agendados;

        return {
          moto: {
            id: moto.id,
            nome: moto.nome,
            marca: moto.marca.nome,
            categoria: moto.categoria,
            quantidade: moto.quantidade,
            ingresso: moto.ingresso.tipo,
          },
          horario: {
            id: horario.id,
            hora: horario.hora,
          },
          agendados,
          disponivel,
          esgotado: disponivel <= 0,
          baixoEstoque:
            disponivel > 0 && disponivel <= Math.ceil(moto.quantidade * 0.2), // 20% do estoque
        };
      });

      return NextResponse.json({
        tipo: "por-horario",
        data: dataObj.toISOString(),
        horario: {
          id: horario.id,
          hora: horario.hora,
        },
        disponibilidade,
      });
    } else {
      // Buscar disponibilidade geral para uma data (todas as motos e horários)
      const motos = await prisma.moto.findMany({
        include: { marca: true, ingresso: true },
        orderBy: [{ marca: { nome: "asc" } }, { nome: "asc" }],
      });

      const horarios = await prisma.horario.findMany({
        where: { eventoId: evento.id },
        orderBy: { hora: "asc" },
      });

      // Buscar todos os agendamentos para esta data
      const agendamentos = await prisma.agendamento.findMany({
        where: {
          data: dataObj,
          eventoId: evento.id,
        },
        include: { moto: { include: { marca: true } }, horario: true },
      });

      // Agrupar agendamentos por moto e horário
      const agendamentosPorMotoHorario = {};
      agendamentos.forEach((agendamento) => {
        const key = `${agendamento.motoId}-${agendamento.horarioId}`;
        if (!agendamentosPorMotoHorario[key]) {
          agendamentosPorMotoHorario[key] = 0;
        }
        agendamentosPorMotoHorario[key]++;
      });

      // Montar resultado
      const disponibilidade = [];
      motos.forEach((moto) => {
        horarios.forEach((horario) => {
          const key = `${moto.id}-${horario.id}`;
          const agendados = agendamentosPorMotoHorario[key] || 0;
          const disponivel = moto.quantidade - agendados;

          disponibilidade.push({
            moto: {
              id: moto.id,
              nome: moto.nome,
              marca: moto.marca.nome,
              categoria: moto.categoria,
              quantidade: moto.quantidade,
              ingresso: moto.ingresso.tipo,
            },
            horario: {
              id: horario.id,
              hora: horario.hora,
            },
            agendados,
            disponivel,
            esgotado: disponivel <= 0,
            baixoEstoque:
              disponivel > 0 && disponivel <= Math.ceil(moto.quantidade * 0.2), // 20% do estoque
          });
        });
      });

      return NextResponse.json({
        tipo: "geral",
        data: dataObj.toISOString(),
        disponibilidade,
      });
    }
  } catch (error) {
    console.error("Erro ao buscar disponibilidade detalhada:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar disponibilidade" },
      { status: 500 }
    );
  }
}
