import { NextResponse } from "next/server";
import { getUserIdOrNull } from "@/lib/session";
import { getTrailModulesForUser } from "@/lib/trail-modules";

export async function GET() {
  const userId = await getUserIdOrNull();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const data = await getTrailModulesForUser(userId);
  return NextResponse.json({ modules: data });
}
