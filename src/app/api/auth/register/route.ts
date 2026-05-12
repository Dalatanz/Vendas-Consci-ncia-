import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { AssociatedCompany } from "@/generated/prisma/enums";
import { digitsOnly } from "@/lib/masks";

const companyMap: Record<string, AssociatedCompany> = {
  Simplifica: AssociatedCompany.SIMPLIFICA,
  Scale: AssociatedCompany.SCALE,
  OTHER: AssociatedCompany.OTHER,
};

function maskCpfLog(cpf: string) {
  if (cpf.length !== 11) return "(inválido)";
  return `${cpf.slice(0, 3)}.***.***-${cpf.slice(9)}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch((e) => {
      console.error("[REGISTER] JSON inválido:", e);
      throw new SyntaxError("Corpo da requisição não é JSON válido.");
    });

    const name = String(body.name ?? "").trim();
    const cpf = digitsOnly(String(body.cpf ?? ""));
    const phone = digitsOnly(String(body.phone ?? ""));
    const companyKey = String(body.company ?? "");
    const password = String(body.password ?? "");
    const emailRaw = String(body.email ?? "").trim().toLowerCase();
    const email = emailRaw.length > 0 ? emailRaw : null;

    console.log("[REGISTER] Payload recebido (sanitizado)", {
      name,
      cpf: maskCpfLog(cpf),
      phoneLen: phone.length,
      companyKey,
      hasEmail: Boolean(email),
    });

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }

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

    console.log("[REGISTER] Consultando CPF/e-mail existentes…");

    const exists = await prisma.user.findUnique({ where: { cpf } });
    if (exists) {
      return NextResponse.json({ error: "CPF já cadastrado." }, { status: 409 });
    }
    if (email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) {
        return NextResponse.json({ error: "E-mail já cadastrado." }, { status: 409 });
      }
    }

    console.log("[REGISTER] Iniciando hash da senha…");
    const passwordHash = await hashPassword(password);
    console.log("[REGISTER] Hash da senha concluído.");

    console.log("[REGISTER] Criando usuário + carteira de pontos…", {
      cpf: maskCpfLog(cpf),
      company,
    });

    const user = await prisma.user.create({
      data: {
        name,
        cpf,
        email,
        phone,
        company,
        passwordHash,
        pointsWallet: {
          create: {},
        },
      },
    });

    console.log("[REGISTER] Usuário criado:", { userId: user.id });

    return NextResponse.json({ ok: true, userId: user.id });
  } catch (error) {
    console.error("REGISTER_ERROR:", error);
    if (error instanceof Error) {
      console.error("REGISTER_ERROR stack:", error.stack);
    }
    if (typeof error === "object" && error !== null && "code" in error) {
      console.error("REGISTER_ERROR code:", (error as { code?: string }).code);
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro interno",
      },
      { status: 500 },
    );
  }
}
