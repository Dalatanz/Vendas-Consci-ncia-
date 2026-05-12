import { prisma } from "@/lib/prisma";
import { getLessonSequentialLock } from "@/lib/lesson-access";

export type TrailModuleSummary = {
  slug: string;
  title: string;
  description: string;
  lessonCount: number;
  durationMin: number;
  progressPct: number;
};

export async function getTrailModulesForUser(userId: string): Promise<TrailModuleSummary[]> {
  const modules = await prisma.courseModule.findMany({
    orderBy: { order: "asc" },
    include: {
      lessons: { orderBy: { order: "asc" }, select: { id: true } },
    },
  });

  const progress = await prisma.userLessonProgress.findMany({
    where: { userId },
  });

  return modules.map((m) => {
    const total = m.lessons.length;
    const done = m.lessons.filter((l) =>
      progress.some((p) => p.lessonId === l.id && p.completed),
    ).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    return {
      slug: m.slug,
      title: m.title,
      description: m.description,
      lessonCount: total,
      durationMin: m.durationMin,
      progressPct: pct,
    };
  });
}

export type ModuleLessonDetail = {
  id: string;
  order: number;
  title: string;
  description: string | null;
  videoUrl: string;
  durationSec: number;
  progressPct: number;
  currentTimeSec: number;
  completed: boolean;
  locked: boolean;
  lockReason: string | null;
};

export type ModuleDetailPayload = {
  module: {
    id: string;
    slug: string;
    title: string;
    description: string;
    durationMin: number;
    progressPct: number;
  };
  lessons: ModuleLessonDetail[];
};

export async function getModuleDetailForUser(
  userId: string,
  slug: string,
): Promise<ModuleDetailPayload | null> {
  const mod = await prisma.courseModule.findUnique({
    where: { slug },
    include: {
      lessons: { orderBy: { order: "asc" } },
    },
  });
  if (!mod) return null;

  const progress = await prisma.userLessonProgress.findMany({
    where: { userId, lesson: { moduleId: mod.id } },
  });

  const lessons: ModuleLessonDetail[] = [];
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

  return {
    module: {
      id: mod.id,
      slug: mod.slug,
      title: mod.title,
      description: mod.description,
      durationMin: mod.durationMin,
      progressPct,
    },
    lessons,
  };
}
