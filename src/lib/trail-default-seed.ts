import { prisma } from "@/lib/prisma";
import { RewardCatalogStatus } from "@/generated/prisma/enums";
import { lessonVideoUrlForModule } from "@/config/trilha-drive-videos";

const DEFAULT_MODULES = [
  {
    order: 1,
    slug: "introducao",
    title: "Módulo 1: Introdução",
    description:
      "Boas-vindas à Universidade Vendas Consciência, propósito da trilha e como extrair o máximo da plataforma.",
    durationMin: 45,
    lessons: [
      { title: "Bem-vindo à universidade", desc: "Visão geral do ecossistema." },
      { title: "Mindset de alta performance", desc: "Como se posicionar para evoluir." },
      { title: "Como usar a plataforma", desc: "Trilha, avaliações e gamificação." },
    ],
  },
  {
    order: 2,
    slug: "fundamentos-vendas",
    title: "Módulo 2: Fundamentos de vendas",
    description: "Base sólida de processo comercial, funil e métricas essenciais.",
    durationMin: 120,
    lessons: [
      { title: "O que é venda consultiva", desc: null },
      { title: "Funil e etapas", desc: null },
      { title: "KPIs que importam", desc: null },
      { title: "Prospecção com método", desc: null },
    ],
  },
  {
    order: 3,
    slug: "consciencia-comercial",
    title: "Módulo 3: Consciência comercial",
    description: "Autoconhecimento, empatia e leitura de contexto no processo de venda.",
    durationMin: 90,
    lessons: [
      { title: "Consciência e resultado", desc: null },
      { title: "Mapa de influências", desc: null },
      { title: "Disciplina emocional", desc: null },
    ],
  },
  {
    order: 4,
    slug: "atendimento-relacionamento",
    title: "Módulo 4: Atendimento e relacionamento",
    description: "Experiência do cliente, fidelização e relacionamento de longo prazo.",
    durationMin: 100,
    lessons: [
      { title: "Primeira impressão", desc: null },
      { title: "Escuta ativa aplicada", desc: null },
      { title: "Pós-venda estratégico", desc: null },
    ],
  },
  {
    order: 5,
    slug: "negociacao",
    title: "Módulo 5: Negociação",
    description: "Técnicas, concessões e construção de acordos sustentáveis.",
    durationMin: 110,
    lessons: [
      { title: "Preparação da negociação", desc: null },
      { title: "Âncoras e valor percebido", desc: null },
      { title: "Objeções com classe", desc: null },
    ],
  },
  {
    order: 6,
    slug: "fechamento",
    title: "Módulo 6: Fechamento",
    description: "Condução segura até o sim, compromissos e próximos passos.",
    durationMin: 85,
    lessons: [
      { title: "Sinais de compra", desc: null },
      { title: "Fechamento assumido", desc: null },
      { title: "Acordo e documentação", desc: null },
    ],
  },
  {
    order: 7,
    slug: "alta-performance",
    title: "Módulo 7: Alta performance",
    description: "Hábitos, rotina comercial e escala de resultados.",
    durationMin: 95,
    lessons: [
      { title: "Rotina de campeão", desc: null },
      { title: "Gestão de energia e foco", desc: null },
      { title: "Escala e liderança comercial", desc: null },
    ],
  },
] as const;

/**
 * Garante módulos, aulas, avaliações e recompensas padrão quando o banco está vazio.
 * Usado no primeiro acesso à trilha (Vercel) e pelo `prisma db seed`.
 */
export async function ensureDefaultTrailInDb(): Promise<void> {
  if ((await prisma.courseModule.count()) > 0) {
    return;
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        if ((await tx.courseModule.count()) > 0) {
          return;
        }
        for (const m of DEFAULT_MODULES) {
          const mod = await tx.courseModule.create({
            data: {
              order: m.order,
              slug: m.slug,
              title: m.title,
              description: m.description,
              durationMin: m.durationMin,
              thumbnailUrl: null,
              lessons: {
                create: m.lessons.map((l, i) => ({
                  order: i + 1,
                  title: l.title,
                  description: l.desc ?? undefined,
                  videoUrl: lessonVideoUrlForModule(m.order),
                  durationSec: 180 + i * 30,
                })),
              },
            },
            include: { lessons: true },
          });

          await tx.assessment.create({
            data: {
              moduleId: mod.id,
              title: `Avaliação — ${m.title.replace(/^Módulo \d+: /, "")}`,
              questionCount: 10,
            },
          });
        }

        if ((await tx.reward.count()) === 0) {
          await tx.reward.createMany({
            data: [
              {
                title: "Aula exclusiva",
                description: "Conteúdo extra liberado pela equipe pedagógica.",
                pointsRequired: 10,
                status: RewardCatalogStatus.AVAILABLE,
                imageUrl: null,
              },
              {
                title: "Material premium",
                description: "Kit PDF avançado de scripts e objeções.",
                pointsRequired: 15,
                status: RewardCatalogStatus.AVAILABLE,
                imageUrl: null,
              },
              {
                title: "Mentoria em grupo",
                description: "Sessão ao vivo com especialista — vagas limitadas.",
                pointsRequired: 25,
                status: RewardCatalogStatus.AVAILABLE,
                imageUrl: null,
              },
              {
                title: "Mentoria individual",
                description: "1h1 com mentor sênior para destravar seu funil.",
                pointsRequired: 40,
                status: RewardCatalogStatus.AVAILABLE,
                imageUrl: null,
              },
              {
                title: "Evento fechado",
                description: "Acesso a encontro exclusivo com líderes comerciais.",
                pointsRequired: 35,
                status: RewardCatalogStatus.COMING_SOON,
                imageUrl: null,
              },
            ],
          });
        }
      },
      { maxWait: 15000, timeout: 120000 },
    );
  } catch (e) {
    if ((await prisma.courseModule.count()) > 0) {
      return;
    }
    throw e;
  }
}
