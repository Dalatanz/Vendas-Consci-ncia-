import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashResetToken, randomUrlToken } from "@/lib/token-crypto";
import { Resend } from "resend";
import { digitsOnly } from "@/lib/masks";

const RESET_TTL_MS = 1000 * 60 * 60;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const cpf = digitsOnly(String(body.cpf ?? ""));
    if (cpf.length !== 11) {
      return NextResponse.json({ error: "CPF inválido." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { cpf } });
    if (!user) {
      return NextResponse.json({
        ok: true,
        message: "Se o CPF estiver cadastrado e houver e-mail vinculado, enviaremos instruções.",
      });
    }
    if (!user.email) {
      return NextResponse.json(
        {
          error:
            "Não há e-mail cadastrado nesta conta. Acesse Meu perfil e informe um e-mail para habilitar a recuperação de senha.",
        },
        { status: 400 },
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
    if (!apiKey || !appUrl) {
      return NextResponse.json(
        {
          error:
            "Servidor sem envio de e-mail configurado (RESEND_API_KEY e NEXT_PUBLIC_APP_URL). Configure na Vercel.",
        },
        { status: 503 },
      );
    }

    const token = randomUrlToken();
    const tokenHash = hashResetToken(token);
    const expiresAt = new Date(Date.now() + RESET_TTL_MS);

    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, usedAt: null },
    });
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const resetUrl = `${appUrl}/recuperar-senha?token=${encodeURIComponent(token)}`;
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: user.email,
      subject: "Universidade Vendas Consciência — redefinição de senha",
      html: `<p>Olá, ${user.name.split(" ")[0] || "aluno"}.</p><p>Para criar uma nova senha, clique no link abaixo (válido por 1 hora):</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Se você não solicitou, ignore este e-mail.</p>`,
    });
    if (error) {
      console.error("[forgot-password] Resend:", error);
      return NextResponse.json({ error: "Falha ao enviar e-mail. Tente mais tarde." }, { status: 502 });
    }

    return NextResponse.json({
      ok: true,
      message: "Se o CPF estiver cadastrado e houver e-mail vinculado, enviaremos instruções.",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao processar solicitação." }, { status: 500 });
  }
}
