import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdOrNull } from "@/lib/session";

export async function GET() {
  const userId = await getUserIdOrNull();
  if (!userId) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const events = await prisma.event.findMany({
    orderBy: [{ active: "desc" }, { startsAt: "asc" }],
    take: 20,
  });

  return NextResponse.json({
    events: events.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      bannerUrl: e.bannerUrl,
      accessUrl: e.accessUrl,
      startsAt: e.startsAt,
      endsAt: e.endsAt,
      active: e.active,
    })),
  });
}
