import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdOrNull } from "@/lib/session";

export async function GET() {
  const userId = await getUserIdOrNull();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const wallet = await prisma.userPoints.findUnique({ where: { userId } });
  const transactions = await prisma.pointTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 80,
  });

  return NextResponse.json({
    wallet: wallet ?? { totalPoints: 0, availablePoints: 0, usedPoints: 0 },
    history: transactions.map((t) => ({
      id: t.id,
      points: t.points,
      type: t.type,
      description: t.description,
      createdAt: t.createdAt,
    })),
  });
}
