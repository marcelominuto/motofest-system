import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { jwtVerify } from "jose";

// Função para verificar autenticação
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

// GET: Apenas admin autenticado pode buscar clientes
export async function GET(req) {
  try {
    const isAuthenticated = await requireAdminAuth(req);

    // Bloquear completamente acesso não autenticado
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Não autorizado. Acesso restrito a administradores." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const cpf = searchParams.get("cpf");

    // Se autenticado (admin), pode listar todos ou buscar por CPF
    if (cpf) {
      const cliente = await prisma.cliente.findUnique({ where: { cpf } });
      if (!cliente) {
        return NextResponse.json(
          { error: "Cliente não encontrado" },
          { status: 404 }
        );
      }
      return NextResponse.json(cliente);
    }

    // Listar todos os clientes (apenas admin)
    const clientes = await prisma.cliente.findMany({
      orderBy: { nome: "asc" },
    });
    return NextResponse.json(clientes);
  } catch (error) {
    console.error("GET /clientes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch client(s)" },
      { status: 500 }
    );
  }
}

// POST: create new client
export async function POST(req) {
  try {
    const { nome, email, cpf, cnh, telefone } = await req.json();

    if (!nome || !cpf) {
      return NextResponse.json(
        { error: "Name and CPF are required" },
        { status: 400 }
      );
    }

    // CPF único
    const exists = await prisma.cliente.findUnique({ where: { cpf } });
    if (exists) {
      return NextResponse.json(
        { error: "A client with this CPF already exists" },
        { status: 409 }
      );
    }

    const novoCliente = await prisma.cliente.create({
      data: { nome, email, cpf, cnh, telefone },
    });

    return NextResponse.json(novoCliente);
  } catch (error) {
    console.error("POST /clientes error:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}
