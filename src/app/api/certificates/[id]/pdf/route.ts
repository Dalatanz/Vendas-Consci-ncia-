import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdOrNull } from "@/lib/session";
import { CertificateStatus } from "@/generated/prisma/enums";
import { buildCertificatePdf } from "@/lib/pdf-certificate";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Params) {
  const userId = await getUserIdOrNull();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const { id } = await ctx.params;
  const inline = new URL(req.url).searchParams.get("inline") === "1";

  const cert = await prisma.userCertificate.findFirst({
    where: { id, userId },
  });
  if (!cert || cert.status !== CertificateStatus.ISSUED) {
    return NextResponse.json({ error: "Certificado não disponível." }, { status: 404 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  const buf = await buildCertificatePdf({
    studentName: user.name,
    title: cert.title,
    issuedAt: cert.issuedAt ?? new Date(),
  });

  const filename = `certificado-${cert.type.toLowerCase()}.pdf`;
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
