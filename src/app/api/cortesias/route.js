import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getEventoAtivo } from "@/lib/getEventoAtivo";

// GET: Listar cortesias (com filtros opcionais: marcaId, utilizado)
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const marcaId = searchParams.get("marcaId");
  const utilizado = searchParams.get("utilizado");
  const queryKeys = [...searchParams.keys()];
  if (
    queryKeys.length > 0 &&
    queryKeys.some((key) => key !== "marcaId" && key !== "utilizado")
  ) {
    return NextResponse.json(
      { error: "Parâmetro de busca inválido" },
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
  const where = {
    eventoId: evento.id,
    ...(marcaId ? { marcaId: parseInt(marcaId, 10) } : {}),
    ...(utilizado === "true"
      ? { utilizado: true }
      : utilizado === "false"
        ? { utilizado: false }
        : {}),
  };
  const cortesias = await prisma.cortesia.findMany({
    where,
    include: { marca: true },
    orderBy: { id: "desc" },
  });
  return NextResponse.json(cortesias);
}

// POST: Criar cortesias em lote
export async function POST(req) {
  try {
    const evento = await getEventoAtivo();
    if (!evento) {
      return NextResponse.json(
        { error: "Nenhum evento ativo encontrado" },
        { status: 404 }
      );
    }
    const { marcaId, quantidade } = await req.json();
    if (!quantidade || quantidade < 1) {
      return NextResponse.json(
        { error: "Quantidade inválida" },
        { status: 400 }
      );
    }
    let marca = null;
    if (marcaId) {
      marca = await prisma.marca.findUnique({
        where: { id: parseInt(marcaId, 10) },
      });
      if (!marca) {
        return NextResponse.json(
          { error: "Marca não encontrada" },
          { status: 404 }
        );
      }
    }
    // Geração dos códigos
    const prefixo = marca
      ? marca.nome.replace(/\s+/g, "").toUpperCase()
      : "ORG";
    const novos = Array.from({ length: quantidade }).map(() => ({
      eventoId: evento.id,
      marcaId: marca ? Number(marca.id) : null, // sempre presente, sempre number ou null
      codigo: `${prefixo}-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`,
      utilizado: false,
    }));
    // Garantir unicidade dos códigos
    for (let i = 0; i < novos.length; i++) {
      let tentativas = 0;
      while (tentativas < 5) {
        const existe = await prisma.cortesia.findUnique({
          where: { codigo: novos[i].codigo },
        });
        if (!existe) break;
        novos[i].codigo = `${prefixo}-${Math.random()
          .toString(36)
          .substring(2, 6)
          .toUpperCase()}`;
        tentativas++;
      }
    }
    // Workaround Prisma: garantir marcaId sempre presente
    novos.forEach((obj) => {
      if (!("marcaId" in obj)) obj.marcaId = null;
    });
    // Workaround Prisma: criar um a um
    let count = 0;
    for (const data of novos) {
      const { eventoId, marcaId, codigo, utilizado } = data;
      const insertData = { eventoId, codigo, utilizado };
      if (marcaId !== null && marcaId !== undefined) {
        insertData.marcaId = marcaId;
      }
      await prisma.cortesia.create({ data: insertData });
      count++;
    }
    return NextResponse.json({ sucesso: true, quantidade: count });
  } catch (error) {
    console.error("Erro ao criar cortesias:", error);
    return NextResponse.json(
      { error: "Erro ao criar cortesias" },
      { status: 500 }
    );
  }
}

// DELETE: Excluir cortesia por id
export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id)
    return NextResponse.json({ error: "ID não informado" }, { status: 400 });
  try {
    await prisma.cortesia.delete({ where: { id: parseInt(id, 10) } });
    return NextResponse.json({ sucesso: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao excluir cortesia" },
      { status: 500 }
    );
  }
}
