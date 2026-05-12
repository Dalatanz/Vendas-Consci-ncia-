import { prisma } from "@/lib/prisma";
import { getUserIdOrNull } from "@/lib/session";

export async function getCurrentUser() {
  const userId = await getUserIdOrNull();
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    include: { pointsWallet: true },
  });
}
