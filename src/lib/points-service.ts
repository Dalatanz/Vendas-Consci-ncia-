import { prisma } from "@/lib/prisma";
import { PointTransactionType } from "@/generated/prisma/enums";

function isUniqueViolation(e: unknown) {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code: string }).code === "P2002"
  );
}

export async function awardLessonPoint(userId: string, lessonId: string) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.pointTransaction.create({
        data: {
          userId,
          points: 1,
          type: PointTransactionType.lesson_completed,
          source: "lesson",
          sourceId: lessonId,
          description: "Aula concluída",
        },
      });
      await tx.userPoints.update({
        where: { userId },
        data: {
          totalPoints: { increment: 1 },
          availablePoints: { increment: 1 },
        },
      });
    });
    return { ok: true as const, awarded: true };
  } catch (e) {
    if (isUniqueViolation(e)) {
      return { ok: true as const, awarded: false };
    }
    throw e;
  }
}

export async function awardActivityPoint(
  userId: string,
  assessmentId: string,
  scorePct: number,
) {
  if (scorePct <= 50) {
    return { ok: true as const, awarded: false };
  }
  try {
    await prisma.$transaction(async (tx) => {
      await tx.pointTransaction.create({
        data: {
          userId,
          points: 1,
          type: PointTransactionType.activity_passed,
          source: "assessment",
          sourceId: assessmentId,
          description: `Atividade aprovada (${Math.round(scorePct)}%)`,
        },
      });
      await tx.userPoints.update({
        where: { userId },
        data: {
          totalPoints: { increment: 1 },
          availablePoints: { increment: 1 },
        },
      });
    });
    return { ok: true as const, awarded: true };
  } catch (e) {
    if (isUniqueViolation(e)) {
      return { ok: true as const, awarded: false };
    }
    throw e;
  }
}

export async function redeemReward(userId: string, rewardId: string) {
  return prisma.$transaction(async (tx) => {
    const reward = await tx.reward.findUnique({ where: { id: rewardId } });
    if (!reward || reward.status === "COMING_SOON") {
      return { ok: false as const, error: "Recompensa indisponível." };
    }
    const wallet = await tx.userPoints.findUnique({ where: { userId } });
    if (!wallet || wallet.availablePoints < reward.pointsRequired) {
      return { ok: false as const, error: "Pontos insuficientes." };
    }
    const existing = await tx.rewardRedemption.findFirst({
      where: { userId, rewardId },
    });
    if (existing) {
      return { ok: false as const, error: "Recompensa já resgatada." };
    }

    const redemption = await tx.rewardRedemption.create({
      data: {
        userId,
        rewardId,
        pointsUsed: reward.pointsRequired,
      },
    });
    await tx.pointTransaction.create({
      data: {
        userId,
        points: -reward.pointsRequired,
        type: PointTransactionType.reward_redeemed,
        source: "reward",
        sourceId: redemption.id,
        description: `Resgate: ${reward.title}`,
      },
    });
    await tx.userPoints.update({
      where: { userId },
      data: {
        availablePoints: { decrement: reward.pointsRequired },
        usedPoints: { increment: reward.pointsRequired },
      },
    });
    return { ok: true as const, redemptionId: redemption.id };
  });
}
