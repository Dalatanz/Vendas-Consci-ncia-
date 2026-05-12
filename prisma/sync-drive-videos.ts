import { prisma } from "../src/lib/prisma";
import { lessonVideoUrlForModule } from "../src/config/trilha-drive-videos";

/** Atualiza videoUrl de todas as aulas conforme env / config (útil após mudar DRIVE_MODULE_VIDEO_IDS). */
async function main() {
  const mods = await prisma.courseModule.findMany({
    orderBy: { order: "asc" },
    include: { lessons: true },
  });
  for (const mod of mods) {
    const url = lessonVideoUrlForModule(mod.order);
    for (const les of mod.lessons) {
      await prisma.lesson.update({
        where: { id: les.id },
        data: { videoUrl: url },
      });
    }
    console.log(`Módulo ${mod.order} (${mod.slug}): ${mod.lessons.length} aula(s) → ${url.slice(0, 60)}…`);
  }
  console.log("Sincronização de vídeos concluída.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
