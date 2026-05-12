import { prisma } from "@/lib/prisma";
import { CertificateStatus, CertificateType } from "@/generated/prisma/enums";

export async function syncUserCertificates(userId: string) {
  const modules = await prisma.courseModule.findMany({
    orderBy: { order: "asc" },
    include: { assessments: true },
  });

  const passed = await prisma.userAssessment.findMany({
    where: { userId, passed: true },
  });
  const passedIds = new Set(passed.map((p) => p.assessmentId));

  for (const mod of modules) {
    const assessment = mod.assessments[0];
    if (!assessment) continue;
    if (!passedIds.has(assessment.id)) continue;

    const certificateKey = `${userId}_m_${mod.id}`;
    await prisma.userCertificate.upsert({
      where: { certificateKey },
      create: {
        userId,
        certificateKey,
        moduleId: mod.id,
        type: CertificateType.MODULE,
        title: `Certificado — ${mod.title}`,
        status: CertificateStatus.ISSUED,
        issuedAt: new Date(),
      },
      update: {
        status: CertificateStatus.ISSUED,
        issuedAt: new Date(),
      },
    });
  }

  const allPassed =
    modules.length > 0 &&
    modules.every((mod) => {
      const a = mod.assessments[0];
      return a && passedIds.has(a.id);
    });

  if (allPassed) {
    const certificateKey = `${userId}_final`;
    await prisma.userCertificate.upsert({
      where: { certificateKey },
      create: {
        userId,
        certificateKey,
        moduleId: null,
        type: CertificateType.FINAL,
        title: "Diploma — Universidade Vendas Consciência",
        status: CertificateStatus.ISSUED,
        issuedAt: new Date(),
      },
      update: {
        status: CertificateStatus.ISSUED,
        issuedAt: new Date(),
      },
    });
  }
}
