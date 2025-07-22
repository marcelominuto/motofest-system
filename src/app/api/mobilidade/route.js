import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";

async function requireAdminAuth(request) {
  const token = request.cookies.get("auth_token")?.value;
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function GET(request) {
  if (!(await requireAdminAuth(request))) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    const mobilidades = await prisma.mobilidade.findMany({
      include: {
        cliente: true,
      },
      orderBy: { id: "desc" },
    });
    // Parse marcas para array
    const result = mobilidades.map((m) => ({
      ...m,
      marcas: Array.isArray(m.marcas)
        ? m.marcas
        : m.marcas
          ? JSON.parse(m.marcas)
          : [],
    }));
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/mobilidade erro:", error);
    return NextResponse.json(
      { error: "Erro ao buscar mobilidade" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    const { clienteId, marcas } = data;
    if (
      !clienteId ||
      !marcas ||
      !Array.isArray(marcas) ||
      marcas.length === 0
    ) {
      return NextResponse.json(
        { error: "Campos obrigatórios não preenchidos" },
        { status: 400 }
      );
    }
    const mobilidade = await prisma.mobilidade.create({
      data: {
        clienteId,
        marcas: JSON.stringify(marcas),
      },
    });
    return NextResponse.json({ ok: true, mobilidade });
  } catch (error) {
    console.error("POST /api/mobilidade erro:", error);
    return NextResponse.json(
      { error: "Erro ao cadastrar mobilidade" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  if (!(await requireAdminAuth(request))) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    const data = await request.json();
    const { id, marcas } = data;
    if (!id || !marcas || !Array.isArray(marcas)) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    const mobilidade = await prisma.mobilidade.update({
      where: { id },
      data: { marcas: JSON.stringify(marcas) },
    });
    return NextResponse.json({ ok: true, mobilidade });
  } catch (error) {
    console.error("PUT /api/mobilidade erro:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar mobilidade" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  if (!(await requireAdminAuth(request))) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ error: "ID não informado" }, { status: 400 });
    }
    await prisma.mobilidade.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/mobilidade erro:", error);
    return NextResponse.json(
      { error: "Erro ao deletar mobilidade" },
      { status: 500 }
    );
  }
}
