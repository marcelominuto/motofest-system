import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { email, senha } = await req.json();

    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) {
      return NextResponse.json(
        { erro: "Admin não encontrado" },
        { status: 404 }
      );
    }

    console.log("Senha enviada:", senha);
    console.log("Hash no banco:", admin.senha);

    const senhaOk = await bcrypt.compare(senha, admin.senha);

    console.log("Resultado da comparação:", senhaOk);

    if (!senhaOk) {
      return NextResponse.json({ erro: "Senha incorreta" }, { status: 401 });
    }

    const token = jwt.sign(
      { id: admin.id, nome: admin.nome, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      token,
      admin: { id: admin.id, nome: admin.nome, email: admin.email },
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json({ erro: "Erro interno" }, { status: 500 });
  }
}
