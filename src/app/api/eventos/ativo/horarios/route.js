import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/eventos/ativo/horarios?data=YYYY-MM-DD
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const dataParam = searchParams.get("data");

  if (!dataParam) {
    return NextResponse.json(
      { error: "Missing 'data' query parameter (YYYY-MM-DD)" },
      { status: 400 }
    );
  }

  try {
    const eventoAtivo = await prisma.evento.findFirst({
      where: { ativo: true },
      select: { id: true },
    });

    if (!eventoAtivo) {
      return NextResponse.json(
        { error: "No active event found" },
        { status: 404 }
      );
    }

    const dataObj = await prisma.data.findFirst({
      where: {
        data: new Date(dataParam),
        eventoId: eventoAtivo.id,
      },
      select: { id: true },
    });

    if (!dataObj) {
      return NextResponse.json(
        { error: "Date not found for active event" },
        { status: 404 }
      );
    }

    const horarios = await prisma.horario.findMany({
      where: {
        eventoId: eventoAtivo.id,
        dataId: dataObj.id,
      },
      orderBy: { hora: "asc" },
    });

    return NextResponse.json(horarios);
  } catch (error) {
    console.error("GET /eventos/ativo/horarios error:", error);
    return NextResponse.json(
      { error: "Failed to fetch horarios" },
      { status: 500 }
    );
  }
}
