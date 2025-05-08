import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: List all motorcycles with brand name
export async function GET() {
  try {
    const motos = await prisma.moto.findMany({
      include: { marca: true },
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
    const { nome, marcaId, quantidade, categoria } = await req.json();

    if (!nome || !marcaId || !quantidade || !categoria) {
      return NextResponse.json(
        {
          error: "All fields (name, brand ID, quantity, category) are required",
        },
        { status: 400 }
      );
    }

    const newMoto = await prisma.moto.create({
      data: {
        nome,
        marcaId: parseInt(marcaId),
        quantidade: parseInt(quantidade),
        categoria,
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
