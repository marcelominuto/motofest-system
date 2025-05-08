import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET: List all brands
export async function GET() {
  try {
    const brands = await prisma.marca.findMany({ orderBy: { nome: "asc" } });
    return NextResponse.json(brands);
  } catch (error) {
    console.error("GET /marcas error:", error);
    return NextResponse.json(
      { error: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

// POST: Create new brand
export async function POST(req) {
  try {
    const { nome } = await req.json();

    if (!nome) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const newBrand = await prisma.marca.create({
      data: { nome },
    });

    return NextResponse.json(newBrand);
  } catch (error) {
    console.error("POST /marcas error:", error);
    return NextResponse.json(
      { error: "Failed to create brand" },
      { status: 500 }
    );
  }
}
