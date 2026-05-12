import { NextResponse } from "next/server";
import { getUserIdOrNull } from "@/lib/session";
import { redeemReward } from "@/lib/points-service";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Params) {
  const userId = await getUserIdOrNull();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const { id } = await ctx.params;

  const result = await redeemReward(userId, id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, redemptionId: result.redemptionId });
}
