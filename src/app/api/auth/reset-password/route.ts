import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { hashResetToken } from "@/lib/token-crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = String(body.token ?? "").trim();
    const password = String(body.password ?? "");
    if (!token || password.length < 6) {
      return NextResponse.json({ error: "Token e nova senha (mín. 6 caracteres) são obrigatórios." }, { status: 400 });
    }

    const tokenHash = hashResetToken(token);
    const row = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });
    if (!row || row.usedAt || row.expiresAt < new Date()) {
      return NextResponse.json({ error: "Link inválido ou expirado. Solicite nova recuperação." }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: row.userId },
        data: { passwordHash: await hashPassword(password) },
      }),
      prisma.passwordResetToken.update({
        where: { id: row.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Não foi possível redefinir a senha." }, { status: 500 });
  }
}
