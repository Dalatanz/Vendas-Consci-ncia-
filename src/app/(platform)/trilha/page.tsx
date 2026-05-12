"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight, Clock } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";

type Mod = {
  slug: string;
  title: string;
  description: string;
  lessonCount: number;
  durationMin: number;
  progressPct: number;
};

export default function TrilhaPage() {
  const [modules, setModules] = useState<Mod[]>([]);

  useEffect(() => {
    fetch("/api/modules")
      .then((r) => r.json())
      .then((d) => setModules(d.modules ?? []))
      .catch(() => setModules([]));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white">
          Trilha de desenvolvimento
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Módulos estruturados para evolução contínua em vendas e consciência comercial. Os vídeos
          serão integrados nesta mesma estrutura — progresso e conclusão alimentam o dashboard e a
          gamificação.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((m, i) => (
          <motion.div
            key={m.slug}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <GlassCard className="h-full hover:border-[color-mix(in_srgb,var(--uvc-neon)_35%,transparent)]">
              <div className="flex aspect-video items-center justify-center rounded-xl bg-gradient-to-br from-zinc-900 to-black">
                <BookOpen className="h-10 w-10 text-[var(--uvc-neon)] opacity-80" />
              </div>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-lg font-semibold text-white">
                {m.title}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm text-zinc-500">{m.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                <span>{m.lessonCount} aulas</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />~{m.durationMin} min
                </span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-[var(--uvc-neon)]"
                  style={{ width: `${m.progressPct}%` }}
                />
              </div>
              <Link
                href={`/trilha/${m.slug}`}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--uvc-neon)] hover:underline"
              >
                Abrir módulo <ChevronRight className="h-4 w-4" />
              </Link>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
