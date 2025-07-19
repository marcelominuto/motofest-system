import prisma from "@/lib/prisma";

export async function getEventoAtivo() {
  const evento = await prisma.evento.findFirst({ where: { ativo: true } });
  return evento;
}
