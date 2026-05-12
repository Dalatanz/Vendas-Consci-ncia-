import { NextResponse } from "next/server";
import { getUserIdOrNull } from "@/lib/session";
import { getModuleDetailForUser } from "@/lib/trail-modules";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: Params) {
  const userId = await getUserIdOrNull();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const { slug } = await ctx.params;

  const data = await getModuleDetailForUser(userId, slug);
  if (!data) {
    return NextResponse.json({ error: "Módulo não encontrado." }, { status: 404 });
  }

  return NextResponse.json(data);
}
