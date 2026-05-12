import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdOrNull } from "@/lib/session";
import { getLessonSequentialLock } from "@/lib/lesson-access";
import { isGoogleDriveEmbedUrl } from "@/config/trilha-drive-videos";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Params) {
  const userId = await getUserIdOrNull();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const { id } = await ctx.params;

  const lock = await getLessonSequentialLock(userId, id);
  if (!lock.unlocked) {
    return NextResponse.json({ error: lock.reason, locked: true }, { status: 403 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      module: {
        include: {
          lessons: { orderBy: { order: "asc" } },
        },
      },
    },
  });
  if (!lesson) {
    return NextResponse.json({ error: "Aula não encontrada." }, { status: 404 });
  }

  const idx = lesson.module.lessons.findIndex((l) => l.id === lesson.id);
  const prevId = idx > 0 ? lesson.module.lessons[idx - 1].id : null;
  const nextId =
    idx < lesson.module.lessons.length - 1 ? lesson.module.lessons[idx + 1].id : null;

  const progress = await prisma.userLessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId: id } },
  });

  const embedDrive = isGoogleDriveEmbedUrl(lesson.videoUrl);

  return NextResponse.json({
    lesson: {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      videoUrl: lesson.videoUrl,
      durationSec: lesson.durationSec,
      embedDrive,
    },
    module: {
      slug: lesson.module.slug,
      title: lesson.module.title,
    },
    prevLessonId: prevId,
    nextLessonId: nextId,
    progress: progress
      ? {
          progressPct: progress.progressPct,
          currentTimeSec: progress.currentTimeSec,
          completed: progress.completed,
        }
      : null,
  });
}
