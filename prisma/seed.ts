import { prisma } from "../src/lib/prisma";
import { ensureDefaultTrailInDb } from "../src/lib/trail-default-seed";

async function main() {
  await ensureDefaultTrailInDb();
  if ((await prisma.courseModule.count()) > 0) {
    console.log("Seed: trilha padrão garantida (módulos/aulas/avaliações/recompensas).");
  }

  if ((await prisma.event.count()) === 0) {
    try {
      const start = new Date(Date.now() + 5 * 86400000);
      const end = new Date(start.getTime() + 90 * 60 * 1000);
      await prisma.event.create({
        data: {
          title: "Live — Performance e mentalidade comercial",
          description:
            "Sessão ao vivo (exemplo). Substitua accessUrl pelo link real (Meet/Zoom) quando for produção.",
          active: true,
          startsAt: start,
          endsAt: end,
          accessUrl: "https://meet.google.com/lookup/placeholder-uvc",
          bannerUrl: null,
        },
      });
      console.log("Seed: evento de exemplo criado.");
    } catch (e) {
      console.warn("Seed: evento de exemplo não criado (schema ou DB).", e);
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
