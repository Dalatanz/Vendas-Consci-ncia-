import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdOrNull } from "@/lib/session";
import { verifyPassword, hashPassword } from "@/lib/password";

export async function POST(req: Request) {
  const userId = await getUserIdOrNull();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const current = String(body.currentPassword ?? "");
  const next = String(body.newPassword ?? "");
  if (current.length < 1 || next.length < 6) {
    return NextResponse.json({ error: "Senha atual e nova senha (mín. 6) são obrigatórias." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }
  const ok = await verifyPassword(current, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Senha atual incorreta." }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(next) },
  });

  await prisma.passwordResetToken.deleteMany({ where: { userId } });

  return NextResponse.json({ ok: true });
}
