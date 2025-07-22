import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: Busca cliente por CPF (público) ou retorna todos se autenticado (admin)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const cpf = searchParams.get("cpf");

    if (cpf) {
      // Busca apenas pelo CPF informado
      const cliente = await prisma.cliente.findUnique({ where: { cpf } });
      if (!cliente) {
        return NextResponse.json(
          { error: "Cliente não encontrado" },
          { status: 404 }
        );
      }
      // Retorne apenas dados mínimos, nunca dados sensíveis!
      return NextResponse.json({
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        cpf: cliente.cpf,
        // ...outros campos públicos
      });
    }

    // Se não houver filtro, retorna todos (mas só admin chega aqui)
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
