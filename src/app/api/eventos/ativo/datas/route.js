import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const eventoAtivo = await prisma.evento.findFirst({
      where: { ativo: true },
      include: {
        datas: {
          orderBy: { data: "asc" },
        },
      },
    });

    if (!eventoAtivo) {
      return NextResponse.json(
        { error: "No active event found" },
        { status: 404 }
      );
    }

    return NextResponse.json(eventoAtivo.datas);
  } catch (error) {
    console.error("Error fetching active event dates:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
