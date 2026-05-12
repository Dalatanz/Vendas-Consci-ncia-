import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdOrNull } from "@/lib/session";

export async function GET() {
  const userId = await getUserIdOrNull();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const wallet = await prisma.userPoints.findUnique({ where: { userId } });
  const available = wallet?.availablePoints ?? 0;

  const rewards = await prisma.reward.findMany({ orderBy: { pointsRequired: "asc" } });
  const redemptions = await prisma.rewardRedemption.findMany({
    where: { userId },
    include: { reward: true },
  });

  const data = rewards.map((r) => {
    const redeemed = redemptions.some((x) => x.rewardId === r.id);
    let uiStatus: "disponivel" | "bloqueada" | "resgatada" | "em_breve" = "disponivel";
    if (r.status === "COMING_SOON") uiStatus = "em_breve";
    else if (redeemed) uiStatus = "resgatada";
    else if (available < r.pointsRequired) uiStatus = "bloqueada";
    return {
      id: r.id,
      title: r.title,
      description: r.description,
      pointsRequired: r.pointsRequired,
      imageUrl: r.imageUrl,
      status: uiStatus,
    };
  });

  return NextResponse.json({ availablePoints: available, rewards: data });
}
