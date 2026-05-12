import { prisma } from "@/lib/prisma";

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
