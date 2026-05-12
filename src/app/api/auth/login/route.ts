import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { signUserToken } from "@/lib/jwt";
import { digitsOnly } from "@/lib/masks";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cpf = digitsOnly(String(body.cpf ?? ""));
    const password = String(body.password ?? "");

    if (cpf.length !== 11 || !password) {
      return NextResponse.json({ error: "CPF e senha são obrigatórios." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { cpf } });
    if (!user) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
    }

    const token = await signUserToken(user.id);
    const res = NextResponse.json({ ok: true });
    res.cookies.set("uvc_token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Erro ao entrar." }, { status: 500 });
  }
}
