import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdOrNull } from "@/lib/session";
import { awardLessonPoint } from "@/lib/points-service";
import { getLessonSequentialLock } from "@/lib/lesson-access";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Params) {
  const userId = await getUserIdOrNull();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const { id } = await ctx.params;

  const lock = await getLessonSequentialLock(userId, id);
  if (!lock.unlocked) {
    return NextResponse.json({ error: lock.reason }, { status: 403 });
  }

  const lesson = await prisma.lesson.findUnique({ where: { id } });
  if (!lesson) {
    return NextResponse.json({ error: "Aula não encontrada." }, { status: 404 });
  }

  await prisma.userLessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId: id } },
    create: {
      userId,
      lessonId: id,
      progressPct: 100,
      completed: true,
      completedAt: new Date(),
    },
    update: {
      progressPct: 100,
      completed: true,
      completedAt: new Date(),
    },
  });

  const point = await awardLessonPoint(userId, id);

  return NextResponse.json({ ok: true, pointsAwarded: point.awarded });
}
