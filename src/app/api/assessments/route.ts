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
    include: { lessons: true, assessments: true },
  });

  const progress = await prisma.userLessonProgress.findMany({ where: { userId } });
  const userAssessments = await prisma.userAssessment.findMany({ where: { userId } });

  const rows: {
    id: string;
    title: string;
    moduleTitle: string;
    locked: boolean;
    status: "bloqueada" | "liberada" | "concluida";
    scorePct: number | null;
    passed: boolean | null;
  }[] = [];

  for (const m of modules) {
    for (const a of m.assessments) {
      const allLessonsDone = m.lessons.every((l) =>
        progress.some((p) => p.lessonId === l.id && p.completed),
      );
      const ua = userAssessments.find((x) => x.assessmentId === a.id);
      const locked = !allLessonsDone;
      let status: "bloqueada" | "liberada" | "concluida" = "bloqueada";
      if (!locked) {
        status = ua ? "concluida" : "liberada";
      }
      rows.push({
        id: a.id,
        title: a.title,
        moduleTitle: m.title,
        locked,
        status,
        scorePct: ua ? Math.round(ua.scorePct) : null,
        passed: ua ? ua.passed : null,
      });
    }
  }

  return NextResponse.json({ assessments: rows });
}
