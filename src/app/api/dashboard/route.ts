import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdOrNull } from "@/lib/session";
import { levelFromTotalPoints, rankingScore, xpProgressInLevel } from "@/lib/gamification";
import { AssociatedCompany } from "@/generated/prisma/enums";
import { ensureDefaultTrailInDb } from "@/lib/trail-default-seed";

const companyLabel: Record<AssociatedCompany, string> = {
  SIMPLIFICA: "Simplifica",
  SCALE: "Scale",
  OTHER: "Outra",
};

export async function GET() {
  const userId = await getUserIdOrNull();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  await ensureDefaultTrailInDb();

  const modules = await prisma.courseModule.findMany({
    orderBy: { order: "asc" },
    include: {
      lessons: { orderBy: { order: "asc" } },
      assessments: true,
    },
  });

  const totalLessons = modules.reduce((a, m) => a + m.lessons.length, 0);

  const progress = await prisma.userLessonProgress.findMany({
    where: { userId },
  });
  const completedLessons = progress.filter((p) => p.completed).length;
  const trailPct = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const lastProgress = await prisma.userLessonProgress.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      lesson: { include: { module: true } },
    },
  });

  const wallet = await prisma.userPoints.findUnique({ where: { userId } });
  const totalPoints = wallet?.totalPoints ?? 0;
  const availablePoints = wallet?.availablePoints ?? 0;

  const level = levelFromTotalPoints(totalPoints);
  const xp = xpProgressInLevel(totalPoints);

  const assessmentsDone = await prisma.userAssessment.findMany({ where: { userId } });

  const allAssessments = await prisma.assessment.findMany({
    include: { module: true },
  });

  let pendingCount = 0;
  for (const a of allAssessments) {
    const mod = modules.find((m) => m.id === a.moduleId);
    if (!mod) continue;
    const allDone = mod.lessons.every((l) =>
      progress.some((p) => p.lessonId === l.id && p.completed),
    );
    const ua = assessmentsDone.find((x) => x.assessmentId === a.id);
    if (allDone && (!ua || !ua.passed)) pendingCount++;
  }

  const rewards = await prisma.reward.findMany({
    where: { status: "AVAILABLE" },
    orderBy: { pointsRequired: "asc" },
  });
  const nextReward =
    rewards.find((r) => r.pointsRequired > availablePoints) ?? rewards[0] ?? null;
  const nextRewardProgress =
    nextReward && nextReward.pointsRequired > 0
      ? Math.min(100, Math.round((availablePoints / nextReward.pointsRequired) * 100))
      : 100;

  const users = await prisma.user.findMany({
    include: {
      pointsWallet: true,
      lessonProgress: true,
      assessments: true,
    },
    take: 200,
  });

  const leaderboard = users
    .map((u) => {
      const tp = u.pointsWallet?.totalPoints ?? 0;
      const ld = u.lessonProgress.filter((p) => p.completed).length;
      const ap = u.assessments.filter((a) => a.passed).length;
      const tl = totalLessons;
      const tPct = tl ? (ld / tl) * 100 : 0;
      const score = rankingScore({
        totalPoints: tp,
        lessonsDone: ld,
        activitiesPassed: ap,
        trailPct: tPct,
      });
      const lvl = levelFromTotalPoints(tp);
      return {
        userId: u.id,
        name: u.name,
        company: companyLabel[u.company],
        totalPoints: tp,
        levelLabel: lvl.label,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((row, i) => ({ ...row, position: i + 1 }));

  const myRank = leaderboard.findIndex((r) => r.userId === userId) + 1;

  return NextResponse.json({
    trailPct,
    completedLessons,
    totalLessons,
    continueLesson: lastProgress
      ? {
          moduleTitle: lastProgress.lesson.module.title,
          lessonTitle: lastProgress.lesson.title,
          progressPct: lastProgress.progressPct,
          lessonId: lastProgress.lessonId,
          moduleSlug: lastProgress.lesson.module.slug,
        }
      : null,
    level: level.label,
    levelKey: level.key,
    totalPoints,
    availablePoints,
    xpBar: xp.pct,
    nextLevelAt: xp.nextLevelAt,
    pendingAssessments: pendingCount,
    pointsCard: {
      availablePoints,
      nextRewardTitle: nextReward?.title ?? "—",
      nextRewardCost: nextReward?.pointsRequired ?? 0,
      progressToNext: nextRewardProgress,
      gapPoints: nextReward ? Math.max(0, nextReward.pointsRequired - availablePoints) : 0,
    },
    leaderboard,
    myRank: myRank || null,
  });
}
