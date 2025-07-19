import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request) {
  const token = request.headers.get("x-seed-token");
  if (token !== process.env.SEED_ADMIN_TOKEN) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { email, senha, nome } = await request.json();
  if (!email || !senha) {
    return NextResponse.json(
      { error: "Email e senha obrigatórios" },
      { status: 400 }
    );
  }
  const existe = await prisma.admin.findUnique({ where: { email } });
  if (existe) {
    return NextResponse.json({ error: "Usuário já existe" }, { status: 409 });
  }
  const hash = await bcrypt.hash(senha, 10);
  const admin = await prisma.admin.create({
    data: { email, senha: hash, nome: nome || "Admin" },
  });
  return NextResponse.json({
    sucesso: true,
    admin: { id: admin.id, email: admin.email },
  });
}
