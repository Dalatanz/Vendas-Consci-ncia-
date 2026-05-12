"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarClock, ExternalLink, Lock, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { NeonButton } from "@/components/NeonButton";

type Ev = {
  id: string;
  title: string;
  description: string | null;
  bannerUrl: string | null;
  accessUrl: string | null;
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
};

function useCountdown(target: Date | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!target) return null;
  const diff = Math.max(0, target.getTime() - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${d}d ${h}h ${m}m ${s}s`;
}

export default function EventosPage() {
  const [events, setEvents] = useState<Ev[]>([]);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .catch(() => setEvents([]));
  }, []);

  const next = events.find((e) => e.active && e.startsAt) ?? null;
  const cd = useCountdown(next?.startsAt ? new Date(next.startsAt) : null);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white">
          Eventos
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Quando forem agendadas palestras, eventos ou conteúdos exclusivos, eles serão disponibilizados
          nesta área por um período determinado.
        </p>
      </div>

      {next ? (
        <GlassCard className="relative overflow-hidden">
          <div className="flex aspect-[21/9] items-center justify-center rounded-xl bg-gradient-to-r from-zinc-900 via-black to-zinc-900">
            <div className="text-center">
              <Sparkles className="mx-auto h-10 w-10 text-[var(--uvc-neon)]" />
              <p className="mt-3 text-sm font-semibold text-white">{next.title}</p>
              {next.description ? (
                <p className="mx-auto mt-2 max-w-lg text-xs text-zinc-500">{next.description}</p>
              ) : null}
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-500">Data</p>
              <p className="mt-1 text-sm text-zinc-300">
                {next.startsAt ? new Date(next.startsAt).toLocaleString("pt-BR") : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-500">Término previsto</p>
              <p className="mt-1 text-sm text-zinc-300">
                {next.endsAt ? new Date(next.endsAt).toLocaleString("pt-BR") : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-500">Contador regressivo</p>
              <p className="mt-1 flex items-center gap-2 font-mono text-sm text-[var(--uvc-neon)]">
                <CalendarClock className="h-4 w-4" />
                {cd ?? "—"}
              </p>
            </div>
          </div>
          {next.accessUrl ? (
            <a href={next.accessUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-block">
              <NeonButton type="button" className="gap-2">
                Acessar evento <ExternalLink className="h-4 w-4" />
              </NeonButton>
            </a>
          ) : (
            <NeonButton type="button" className="mt-6" disabled>
              Link em definição
            </NeonButton>
          )}
        </GlassCard>
      ) : (
        <GlassCard>
          <p className="text-sm text-zinc-400">
            Sem eventos ativos no momento. Quando o administrador publicar um evento, ele aparecerá
            aqui com data, contador e link de acesso.
          </p>
        </GlassCard>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-start gap-3 text-sm text-zinc-500"
      >
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" />
        Eventos podem exigir liberação por pontos ou conclusão de módulos — a estrutura de API já está
        preparada para expansão.
      </motion.div>
    </div>
  );
}
