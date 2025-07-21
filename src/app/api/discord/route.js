import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const payload = await req.json();
    if (process.env.DISCORD_WEBHOOK_URL) {
      await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erro ao enviar webhook para Discord:", err);
    return NextResponse.json(
      { error: "Erro ao enviar webhook" },
      { status: 500 }
    );
  }
}
