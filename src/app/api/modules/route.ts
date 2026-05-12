import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdOrNull } from "@/lib/session";

export async function GET() {
  const userId = await getUserIdOrNull();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const modules = await prisma.courseModule.findMany({
    orderBy: { order: "asc" },
    include: {
      lessons: { orderBy: { order: "asc" }, select: { id: true } },
    },
  });

  const progress = await prisma.userLessonProgress.findMany({
    where: { userId },
  });

  const data = modules.map((m) => {
    const total = m.lessons.length;
    const done = m.lessons.filter((l) =>
      progress.some((p) => p.lessonId === l.id && p.completed),
    ).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    return {
      id: m.id,
      order: m.order,
      slug: m.slug,
      title: m.title,
      description: m.description,
      thumbnailUrl: m.thumbnailUrl,
      durationMin: m.durationMin,
      lessonCount: total,
      progressPct: pct,
    };
  });

  return NextResponse.json({ modules: data });
}
