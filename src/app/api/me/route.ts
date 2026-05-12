import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdOrNull } from "@/lib/session";
import { maskCpf } from "@/lib/masks";
import { AssociatedCompany } from "@/generated/prisma/enums";

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
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { pointsWallet: true },
  });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }
  return NextResponse.json({
    id: user.id,
    name: user.name,
    cpfMasked: maskCpf(user.cpf),
    phone: user.phone,
    company: companyLabel[user.company],
    avatarUrl: user.avatarUrl,
    points: user.pointsWallet ?? {
      totalPoints: 0,
      availablePoints: 0,
      usedPoints: 0,
    },
  });
}
