"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronRight, Crown, Flame, Medal, Play, Sparkles, Trophy } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { NeonButton } from "@/components/NeonButton";

type DashboardData = {
  trailPct: number;
  pendingAssessments: number;
  level: string;
  levelKey: string;
  totalPoints: number;
  availablePoints: number;
  xpBar: number;
  continueLesson: null | {
    moduleTitle: string;
    lessonTitle: string;
    progressPct: number;
    lessonId: string;
    moduleSlug: string;
  };
  pointsCard: {
    availablePoints: number;
    nextRewardTitle: string;
    nextRewardCost: number;
    progressToNext: number;
    gapPoints: number;
  };
  leaderboard: {
    position: number;
    name: string;
    company: string;
    totalPoints: number;
    levelLabel: string;
  }[];
};

const medals: Record<string, string[]> = {
  iniciante: ["Explorador"],
  evolucao: ["Explorador", "Momentum"],
  performer: ["Explorador", "Momentum", "Closer"],
  especialista: ["Explorador", "Momentum", "Closer", "Estrategista"],
  elite: ["Explorador", "Momentum", "Closer", "Estrategista", "Lenda comercial"],
};

function RingProgress({ pct }: { pct: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative mx-auto h-36 w-36">
      <svg className="-rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#1f1f1f" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="var(--uvc-neon)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-all duration-700"
          style={{ filter: "drop-shadow(0 0 8px color-mix(in srgb, var(--uvc-neon) 50%, transparent))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold text-white">{pct}%</span>
        <span className="text-[10px] uppercase tracking-widest text-zinc-500">Trilha</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  if (!data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-zinc-500">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 animate-pulse rounded-full bg-[var(--uvc-neon)]" />
          Carregando inteligência da plataforma…
        </div>
      </div>
    );
  }

  const m = medals[data.levelKey] ?? medals.iniciante;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-white md:text-4xl">
          Painel de evolução
        </h1>
        <p className="mt-2 text-zinc-400">
          Visão unificada de progresso, performance comercial e gamificação — evolua com método e
          consciência.
        </p>
      </motion.div>

      <div className="grid gap-5 lg:grid-cols-12">
        <GlassCard className="lg:col-span-4">
          <div className="flex items-center gap-2 text-[var(--uvc-neon)]">
            <Calendar className="h-5 w-5" />
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
              Eventos
            </h2>
          </div>
          <p className="mt-4 text-sm font-medium text-zinc-300">Sem eventos previstos no momento.</p>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            Quando forem agendadas palestras, eventos ou conteúdos exclusivos, eles serão
            disponibilizados aqui por tempo determinado.
          </p>
        </GlassCard>

        <GlassCard className="lg:col-span-4">
          <div className="flex items-center gap-2 text-[var(--uvc-neon)]">
            <Play className="h-5 w-5" />
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
              Continue de onde parou
            </h2>
          </div>
          {data.continueLesson ? (
            <>
              <p className="mt-3 text-xs uppercase tracking-widest text-zinc-500">
                {data.continueLesson.moduleTitle}
              </p>
              <p className="mt-1 text-base font-semibold text-white">{data.continueLesson.lessonTitle}</p>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-[var(--uvc-neon)] transition-all"
                  style={{ width: `${data.continueLesson.progressPct}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                Progresso do vídeo: {Math.round(data.continueLesson.progressPct)}%
              </p>
              <Link
                href={`/trilha/${data.continueLesson.moduleSlug}/${data.continueLesson.lessonId}`}
                className="mt-4 inline-block"
              >
                <NeonButton type="button" className="gap-2">
                  Continuar <ChevronRight className="h-4 w-4" />
                </NeonButton>
              </Link>
            </>
          ) : (
            <p className="mt-4 text-sm text-zinc-400">
              Inicie pela trilha de desenvolvimento para registrar seu streaming educacional e
              retomar automaticamente de onde parou.
            </p>
          )}
        </GlassCard>

        <GlassCard className="lg:col-span-4">
          <div className="flex items-center gap-2 text-[var(--uvc-neon)]">
            <Crown className="h-5 w-5" />
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
              Seu level
            </h2>
          </div>
          <p className="mt-3 text-2xl font-bold text-white">{data.level}</p>
          <p className="mt-1 text-xs text-zinc-500">
            XP acumulado (pontos totais): <span className="text-[var(--uvc-neon)]">{data.totalPoints}</span>
          </p>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--uvc-neon-dim)] to-[var(--uvc-neon)]"
              style={{ width: `${data.xpBar}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-zinc-500">Progresso até o próximo nível</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {m.map((med) => (
              <span
                key={med}
                className="inline-flex items-center gap-1 rounded-full border border-[color-mix(in_srgb,var(--uvc-neon)_25%,transparent)] bg-black/40 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--uvc-neon)]"
              >
                <Medal className="h-3 w-3" />
                {med}
              </span>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="lg:col-span-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[var(--uvc-neon)]">
              <Trophy className="h-5 w-5" />
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
                Ranking geral
              </h2>
            </div>
            <Flame className="h-5 w-5 text-orange-400/80" />
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Pontuação, aulas, avaliações e engajamento na trilha — leaderboard premium.
          </p>
          <ul className="mt-4 space-y-2">
            {data.leaderboard.map((row) => (
              <li
                key={row.position}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-black/30 px-3 py-2 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-mono text-xs text-[var(--uvc-neon)]">
                    #{row.position}
                  </span>
                  <div>
                    <p className="font-medium text-white">{row.name}</p>
                    <p className="text-[11px] text-zinc-500">{row.company}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[var(--uvc-neon)]">{row.totalPoints} pts</p>
                  <p className="text-[10px] text-zinc-500">{row.levelLabel}</p>
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard className="lg:col-span-3">
          <div className="flex items-center gap-2 text-[var(--uvc-neon)]">
            <Sparkles className="h-5 w-5" />
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
              Avaliações pendentes
            </h2>
          </div>
          <p className="mt-6 text-4xl font-bold text-white">{data.pendingAssessments}</p>
          <p className="mt-1 text-xs text-zinc-500">aguardando sua ação</p>
          <p className="mt-4 text-xs text-zinc-400">
            Conclua as aulas de cada módulo para liberar as avaliações correspondentes.
          </p>
          <Link href="/avaliacoes" className="mt-4 inline-block text-sm font-medium text-[var(--uvc-neon)] hover:underline">
            Ir para avaliações
          </Link>
        </GlassCard>

        <GlassCard className="lg:col-span-4 flex flex-col items-center justify-center py-6">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
            % de conclusão
          </h2>
          <RingProgress pct={data.trailPct} />
        </GlassCard>

        <GlassCard className="lg:col-span-4">
          <div className="flex items-center gap-2 text-[var(--uvc-neon)]">
            <Sparkles className="h-5 w-5" />
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
              Meus pontos
            </h2>
          </div>
          <p className="mt-3 text-3xl font-bold text-white">{data.pointsCard.availablePoints}</p>
          <p className="text-xs text-zinc-500">pontos disponíveis</p>
          <p className="mt-4 text-sm text-zinc-300">
            Próxima recompensa:{" "}
            <span className="font-semibold text-[var(--uvc-neon)]">{data.pointsCard.nextRewardTitle}</span>
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            {data.pointsCard.gapPoints > 0
              ? `Faltam ${data.pointsCard.gapPoints} pontos para liberar.`
              : "Você já pode resgatar esta recompensa."}
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-[var(--uvc-neon)]"
              style={{ width: `${data.pointsCard.progressToNext}%` }}
            />
          </div>
          <Link href="/recompensas" className="mt-4 inline-block">
            <NeonButton type="button" variant="ghost" className="text-sm">
              Ver recompensas
            </NeonButton>
          </Link>
        </GlassCard>
      </div>
    </div>
  );
}
