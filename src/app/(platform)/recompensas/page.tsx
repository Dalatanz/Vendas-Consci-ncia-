"use client";

import { useEffect, useState } from "react";
import { Gift, Lock } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { NeonButton } from "@/components/NeonButton";

type Reward = {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  status: "disponivel" | "bloqueada" | "resgatada" | "em_breve";
};

export default function RecompensasPage() {
  const [available, setAvailable] = useState(0);
  const [rewards, setRewards] = useState<Reward[]>([]);

  async function refresh() {
    const r = await fetch("/api/rewards");
    const d = await r.json();
    setAvailable(d.availablePoints ?? 0);
    setRewards(d.rewards ?? []);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function redeem(id: string, title: string, cost: number) {
    if (!window.confirm(`Confirmar resgate de "${title}" por ${cost} pontos?`)) return;
    const res = await fetch(`/api/rewards/${id}/redeem`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      window.alert(data.error ?? "Não foi possível resgatar.");
      return;
    }
    window.alert("Resgate concluído! Os pontos foram debitados.");
    await refresh();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white">
          Loja de recompensas
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Troque pontos por benefícios exclusivos: conteúdos, mentorias, eventos fechados e mais. Cada
          resgate gera histórico e atualiza seu saldo imediatamente.
        </p>
        <p className="mt-3 text-sm font-semibold text-[var(--uvc-neon)]">
          Seus pontos disponíveis: {available}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {rewards.map((rw) => (
          <GlassCard key={rw.id} className="flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <Gift className="h-8 w-8 text-[var(--uvc-neon)]" />
              {rw.status === "em_breve" ? (
                <span className="rounded-full border border-zinc-600 px-2 py-0.5 text-[10px] uppercase text-zinc-400">
                  Em breve
                </span>
              ) : null}
            </div>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-lg font-semibold text-white">
              {rw.title}
            </h2>
            <p className="mt-2 flex-1 text-sm text-zinc-500">{rw.description}</p>
            <p className="mt-4 text-sm text-zinc-400">
              Custo: <span className="font-bold text-[var(--uvc-neon)]">{rw.pointsRequired} pts</span>
            </p>
            {rw.status === "disponivel" && (
              <NeonButton type="button" className="mt-4 w-full" onClick={() => redeem(rw.id, rw.title, rw.pointsRequired)}>
                Resgatar
              </NeonButton>
            )}
            {rw.status === "bloqueada" && (
              <NeonButton type="button" className="mt-4 w-full" disabled variant="ghost">
                Pontos insuficientes
              </NeonButton>
            )}
            {rw.status === "resgatada" && (
              <NeonButton type="button" className="mt-4 w-full" disabled variant="ghost">
                Resgatada
              </NeonButton>
            )}
            {rw.status === "em_breve" && (
              <NeonButton type="button" className="mt-4 w-full" disabled>
                Em breve
              </NeonButton>
            )}
          </GlassCard>
        ))}
      </div>

      <div className="flex items-start gap-2 text-xs text-zinc-500">
        <Lock className="mt-0.5 h-4 w-4 shrink-0" />
        Regras de segurança: sem resgate sem saldo, sem pontuação duplicada por aula ou atividade, toda
        movimentação registrada no histórico de pontos.
      </div>
    </div>
  );
}
