import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdOrNull } from "@/lib/session";

const FILES = [
  {
    id: "guia-intro",
    title: "Guia rápido — Introdução",
    description: "Boas práticas após concluir o módulo de introdução.",
    path: "/biblioteca/guia-introducao.txt",
  },
  {
    id: "checklist-vendas",
    title: "Checklist diário de vendas",
    description: "Rotina enxuta para manter performance.",
    path: "/biblioteca/checklist-vendas.txt",
  },
];

export async function GET() {
  const userId = await getUserIdOrNull();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const intro = await prisma.courseModule.findUnique({
    where: { slug: "introducao" },
    include: { lessons: true },
  });
  if (!intro) {
    return NextResponse.json({ unlocked: false, files: [] });
  }

  const progress = await prisma.userLessonProgress.findMany({
    where: { userId, lesson: { moduleId: intro.id } },
  });
  const done = intro.lessons.every((l) =>
    progress.some((p) => p.lessonId === l.id && p.completed),
  );

  return NextResponse.json({
    unlocked: done,
    files: done ? FILES : [],
  });
}
