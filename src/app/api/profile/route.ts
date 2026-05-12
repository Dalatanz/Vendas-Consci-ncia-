import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdOrNull } from "@/lib/session";
import { digitsOnly } from "@/lib/masks";

export async function PATCH(req: Request) {
  const userId = await getUserIdOrNull();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const name = body.name != null ? String(body.name).trim() : undefined;
  const phoneRaw = body.phone != null ? digitsOnly(String(body.phone)) : undefined;
  const emailRaw = body.email != null ? String(body.email).trim().toLowerCase() : undefined;

  const data: { name?: string; phone?: string; email?: string | null } = {};
  if (name !== undefined) {
    if (name.length < 3) {
      return NextResponse.json({ error: "Nome muito curto." }, { status: 400 });
    }
    data.name = name;
  }
  if (phoneRaw !== undefined) {
    if (phoneRaw.length < 10) {
      return NextResponse.json({ error: "Telefone inválido." }, { status: 400 });
    }
    data.phone = phoneRaw;
  }
  if (emailRaw !== undefined) {
    if (emailRaw.length === 0) {
      data.email = null;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw)) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    } else {
      const taken = await prisma.user.findFirst({
        where: { email: emailRaw, NOT: { id: userId } },
      });
      if (taken) {
        return NextResponse.json({ error: "E-mail já em uso." }, { status: 409 });
      }
      data.email = emailRaw;
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data,
  });

  return NextResponse.json({ ok: true });
}
