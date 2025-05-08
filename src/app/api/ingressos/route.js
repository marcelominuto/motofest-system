import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: List all ticket types (Ingressos)
export async function GET() {
  try {
    const ingressos = await prisma.ingresso.findMany({
      include: {
        evento: true,
      },
      orderBy: {
        tipo: "asc",
      },
    });

    return NextResponse.json(ingressos);
  } catch (error) {
    console.error("GET /api/ingressos error:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket types" },
      { status: 500 }
    );
  }
}

// POST: Create new ingresso
export async function POST(req) {
  try {
    const {
      eventoId,
      tipo,
      descricao,
      valor,
      valor1,
      valor2,
      valor3,
      limite,
      categoria,
    } = await req.json();

    if (!eventoId || !tipo || !categoria) {
      return NextResponse.json(
        { error: "Campos obrigatórios estão faltando." },
        { status: 400 }
      );
    }

    const data = {
      eventoId: parseInt(eventoId),
      tipo,
      descricao: descricao || null,
      limite: limite ? parseInt(limite) : null,
      categoria,
    };

    if (categoria === "normal") {
      if (!valor) {
        return NextResponse.json(
          { error: "Valor obrigatório para categoria normal." },
          { status: 400 }
        );
      }
      data.valor = parseFloat(valor);
    } else if (categoria === "test ride") {
      if (!valor1 || !valor2 || !valor3) {
        return NextResponse.json(
          { error: "Valores para test ride são obrigatórios." },
          { status: 400 }
        );
      }
      data.valor1 = parseFloat(valor1);
      data.valor2 = parseFloat(valor2);
      data.valor3 = parseFloat(valor3);
    }

    const ingresso = await prisma.ingresso.create({ data });

    return NextResponse.json(ingresso);
  } catch (error) {
    console.error("POST /api/ingressos error:", error);
    return NextResponse.json(
      { error: "Erro ao criar ingresso" },
      { status: 500 }
    );
  }
}
