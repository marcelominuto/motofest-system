import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getEventoAtivo } from "@/lib/getEventoAtivo";

// GET: List all motorcycles with brand name and ingresso
export async function GET() {
  try {
    const motos = await prisma.moto.findMany({
      include: {
        marca: true,
        ingresso: true,
      },
      orderBy: { nome: "asc" },
    });
    return NextResponse.json(motos);
  } catch (error) {
    console.error("GET /motos error:", error);
    return NextResponse.json(
      { error: "Failed to fetch motorcycles" },
      { status: 500 }
    );
  }
}

// POST: Create new motorcycle
export async function POST(req) {
  try {
    const {
      nome,
      marcaId,
      quantidade,
      categoria,
      ingressoId,
      foto,
      cvs,
      cilindradas,
    } = await req.json();

    if (!nome || !marcaId || !quantidade || !categoria || !ingressoId) {
      return NextResponse.json(
        {
          error:
            "All fields (name, brand ID, quantity, category, ingresso ID) are required",
        },
        { status: 400 }
      );
    }

    const evento = await getEventoAtivo();
    if (!evento) {
      return NextResponse.json(
        { error: "Nenhum evento ativo encontrado." },
        { status: 404 }
      );
    }

    // Verificar se o ingresso existe
    const ingresso = await prisma.ingresso.findUnique({
      where: { id: parseInt(ingressoId) },
    });

    if (!ingresso) {
      return NextResponse.json(
        { error: "Ingresso não encontrado." },
        { status: 404 }
      );
    }

    const newMoto = await prisma.moto.create({
      data: {
        nome,
        marcaId: parseInt(marcaId),
        ingressoId: parseInt(ingressoId),
        quantidade: parseInt(quantidade),
        categoria,
        foto: foto || null,
        cvs: cvs || null,
        cilindradas: cilindradas || null,
      },
      include: {
        marca: true,
        ingresso: true,
      },
    });

    return NextResponse.json(newMoto);
  } catch (error) {
    console.error("POST /motos error:", error);
    return NextResponse.json(
      { error: "Failed to create motorcycle" },
      { status: 500 }
    );
  }
}
