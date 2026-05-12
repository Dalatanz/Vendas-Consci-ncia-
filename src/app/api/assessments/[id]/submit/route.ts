import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdOrNull } from "@/lib/session";
import { awardActivityPoint } from "@/lib/points-service";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Params) {
  const userId = await getUserIdOrNull();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const correctCount = Math.max(0, Math.floor(Number(body.correctCount ?? 0)));

  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: { module: { include: { lessons: true } } },
  });
  if (!assessment) {
    return NextResponse.json({ error: "Avaliação não encontrada." }, { status: 404 });
  }

  const progress = await prisma.userLessonProgress.findMany({
    where: { userId },
  });
  const allLessonsDone = assessment.module.lessons.every((l) =>
    progress.some((p) => p.lessonId === l.id && p.completed),
  );
  if (!allLessonsDone) {
    return NextResponse.json({ error: "Módulo ainda não concluído." }, { status: 403 });
  }

  const q = assessment.questionCount || 10;
  const scorePct = q ? (correctCount / q) * 100 : 0;
  const passed = scorePct > 50;

  await prisma.userAssessment.upsert({
    where: { userId_assessmentId: { userId, assessmentId: id } },
    create: {
      userId,
      assessmentId: id,
      correctCount,
      scorePct,
      passed,
      completedAt: new Date(),
    },
    update: {
      correctCount,
      scorePct,
      passed,
      completedAt: new Date(),
    },
  });

  const pts = passed ? await awardActivityPoint(userId, id, scorePct) : { awarded: false };

  return NextResponse.json({
    ok: true,
    scorePct: Math.round(scorePct),
    passed,
    pointsAwarded: pts.awarded,
  });
}
