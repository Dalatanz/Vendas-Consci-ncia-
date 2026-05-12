"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarClock, Lock, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { NeonButton } from "@/components/NeonButton";

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
  const future = null as Date | null;
  const cd = useCountdown(future);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white">
          Eventos
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Quando forem agendadas palestras, eventos ou conteúdos exclusivos, eles serão
          disponibilizados nesta área por um período determinado.
        </p>
      </div>

      <GlassCard className="relative overflow-hidden">
        <div className="flex aspect-[21/9] items-center justify-center rounded-xl bg-gradient-to-r from-zinc-900 via-black to-zinc-900">
          <div className="text-center">
            <Sparkles className="mx-auto h-10 w-10 text-[var(--uvc-neon)]" />
            <p className="mt-3 text-sm text-zinc-500">Área reservada para banner do próximo evento</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-500">Data</p>
            <p className="mt-1 text-sm text-zinc-300">A definir</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-500">Horário</p>
            <p className="mt-1 text-sm text-zinc-300">—</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-zinc-500">Contador regressivo</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-mono text-[var(--uvc-neon)]">
              <CalendarClock className="h-4 w-4" />
              {cd ?? "Aguardando próximo evento"}
            </p>
          </div>
        </div>
        <NeonButton type="button" className="mt-6 w-full md:w-auto" disabled>
          Acesso ao evento
        </NeonButton>
      </GlassCard>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3 text-sm text-zinc-500">
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" />
        Conteúdos ao vivo podem exigir liberação por pontos ou conclusão de módulos — estrutura
        pronta para integração futura.
      </motion.div>
    </div>
  );
}
