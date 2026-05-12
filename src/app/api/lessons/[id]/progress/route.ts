import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdOrNull } from "@/lib/session";
import { getLessonSequentialLock } from "@/lib/lesson-access";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Params) {
  const userId = await getUserIdOrNull();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const { id } = await ctx.params;

  const lock = await getLessonSequentialLock(userId, id);
  if (!lock.unlocked) {
    return NextResponse.json({ error: lock.reason }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const progressPct = Math.min(100, Math.max(0, Number(body.progressPct ?? 0)));
  const currentTimeSec = Math.max(0, Math.floor(Number(body.currentTimeSec ?? 0)));

  const lesson = await prisma.lesson.findUnique({ where: { id } });
  if (!lesson) {
    return NextResponse.json({ error: "Aula não encontrada." }, { status: 404 });
  }

  const completed = Boolean(body.completed) || progressPct >= 95;

  await prisma.userLessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId: id } },
    create: {
      userId,
      lessonId: id,
      progressPct: completed ? 100 : progressPct,
      currentTimeSec,
      completed,
      completedAt: completed ? new Date() : null,
    },
    update: {
      progressPct: completed ? 100 : progressPct,
      currentTimeSec,
      completed: completed ? true : undefined,
      completedAt: completed ? new Date() : undefined,
    },
  });

  return NextResponse.json({ ok: true });
}
