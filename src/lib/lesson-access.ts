import { prisma } from "@/lib/prisma";

/**
 * Dentro do mesmo módulo: aula 1 sempre liberada; aula N só após concluir aula N-1.
 */
export async function getLessonSequentialLock(userId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          lessons: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!lesson) {
    return { unlocked: false as const, reason: "Aula não encontrada." };
  }

  if (lesson.order <= 1) {
    return { unlocked: true as const, reason: null };
  }

  const prev = lesson.module.lessons.find((l) => l.order === lesson.order - 1);
  if (!prev) {
    return { unlocked: true as const, reason: null };
  }

  const prevProgress = await prisma.userLessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId: prev.id } },
  });

  if (prevProgress?.completed) {
    return { unlocked: true as const, reason: null };
  }

  return {
    unlocked: false as const,
    reason: "Conclua a aula anterior deste módulo para liberar esta aula.",
  };
}
