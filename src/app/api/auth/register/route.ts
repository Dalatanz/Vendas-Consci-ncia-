import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { AssociatedCompany } from "@/generated/prisma/enums";
import { digitsOnly } from "@/lib/masks";

const companyMap: Record<string, AssociatedCompany> = {
  Simplifica: AssociatedCompany.SIMPLIFICA,
  Scale: AssociatedCompany.SCALE,
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const cpf = digitsOnly(String(body.cpf ?? ""));
    const phone = digitsOnly(String(body.phone ?? ""));
    const companyKey = String(body.company ?? "");
    const password = String(body.password ?? "");

    if (name.length < 3) {
      return NextResponse.json({ error: "Informe o nome completo." }, { status: 400 });
    }
    if (cpf.length !== 11) {
      return NextResponse.json({ error: "CPF inválido." }, { status: 400 });
    }
    if (phone.length < 10) {
      return NextResponse.json({ error: "Telefone inválido." }, { status: 400 });
    }
    const company = companyMap[companyKey] ?? AssociatedCompany.OTHER;
    if (password.length < 6) {
      return NextResponse.json({ error: "Senha deve ter no mínimo 6 caracteres." }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { cpf } });
    if (exists) {
      return NextResponse.json({ error: "CPF já cadastrado." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        cpf,
        phone,
        company,
        passwordHash,
        pointsWallet: {
          create: {},
        },
      },
    });

    return NextResponse.json({ ok: true, userId: user.id });
  } catch {
    return NextResponse.json({ error: "Não foi possível cadastrar." }, { status: 500 });
  }
}
