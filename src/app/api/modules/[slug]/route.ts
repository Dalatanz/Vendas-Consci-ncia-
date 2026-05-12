import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdOrNull } from "@/lib/session";
import { getLessonSequentialLock } from "@/lib/lesson-access";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: Params) {
  const userId = await getUserIdOrNull();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const { slug } = await ctx.params;

  const mod = await prisma.courseModule.findUnique({
    where: { slug },
    include: {
      lessons: { orderBy: { order: "asc" } },
    },
  });
  if (!mod) {
    return NextResponse.json({ error: "Módulo não encontrado." }, { status: 404 });
  }

  const progress = await prisma.userLessonProgress.findMany({
    where: { userId, lesson: { moduleId: mod.id } },
  });

  const lessons = [];
  for (const l of mod.lessons) {
    const p = progress.find((x) => x.lessonId === l.id);
    const lock = await getLessonSequentialLock(userId, l.id);
    lessons.push({
      id: l.id,
      order: l.order,
      title: l.title,
      description: l.description,
      videoUrl: l.videoUrl,
      durationSec: l.durationSec,
      progressPct: p?.progressPct ?? 0,
      currentTimeSec: p?.currentTimeSec ?? 0,
      completed: p?.completed ?? false,
      locked: !lock.unlocked,
      lockReason: lock.reason,
    });
  }

  const done = lessons.filter((l) => l.completed).length;
  const progressPct = lessons.length ? Math.round((done / lessons.length) * 100) : 0;

  return NextResponse.json({
    module: {
      id: mod.id,
      slug: mod.slug,
      title: mod.title,
      description: mod.description,
      durationMin: mod.durationMin,
      progressPct,
    },
    lessons,
  });
}
