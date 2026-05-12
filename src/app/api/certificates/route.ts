import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdOrNull } from "@/lib/session";
import { syncUserCertificates } from "@/lib/certificate-service";
import { CertificateStatus } from "@/generated/prisma/enums";

export async function GET() {
  const userId = await getUserIdOrNull();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  await syncUserCertificates(userId);

  const rows = await prisma.userCertificate.findMany({
    where: { userId },
    orderBy: { issuedAt: "desc" },
  });

  const certificates = rows.map((c) => ({
    id: c.id,
    title: c.title,
    type: c.type,
    status: c.status,
    issuedAt: c.issuedAt,
    downloadable: c.status === CertificateStatus.ISSUED,
  }));

  return NextResponse.json({ certificates });
}
