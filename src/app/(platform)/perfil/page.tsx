"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { NeonButton } from "@/components/NeonButton";
import { levelFromTotalPoints, xpProgressInLevel } from "@/lib/gamification";

type Me = {
  name: string;
  cpfMasked: string;
  phone: string;
  company: string;
  avatarUrl: string | null;
  points: { totalPoints: number; availablePoints: number; usedPoints: number };
};

export default function PerfilPage() {
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then(setMe)
      .catch(() => setMe(null));
  }, []);

  if (!me) {
    return <p className="text-zinc-500">Carregando perfil…</p>;
  }

  const lvl = levelFromTotalPoints(me.points.totalPoints);
  const xp = xpProgressInLevel(me.points.totalPoints);

  return (
    <div className="space-y-8">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white">
        Meu perfil
      </h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="flex flex-col items-center text-center lg:col-span-1">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-[var(--uvc-neon)] bg-zinc-900">
            {me.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={me.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              <User className="h-12 w-12 text-zinc-500" />
            )}
          </div>
          <h2 className="mt-4 text-xl font-semibold text-white">{me.name}</h2>
          <p className="text-sm text-[var(--uvc-neon)]">{me.company}</p>
          <p className="mt-2 text-xs text-zinc-500">CPF: {me.cpfMasked}</p>
          <p className="text-xs text-zinc-500">Telefone: {me.phone}</p>
        </GlassCard>

        <GlassCard className="lg:col-span-2">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
            Evolução
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-zinc-500">Nível</p>
              <p className="text-2xl font-bold text-white">{lvl.label}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-zinc-500">XP (pontos totais)</p>
              <p className="text-2xl font-bold text-[var(--uvc-neon)]">{me.points.totalPoints}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs uppercase text-zinc-500">Progresso até próximo nível</p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-[var(--uvc-neon)]"
                  style={{ width: `${xp.pct}%` }}
                />
              </div>
            </div>
            <div>
              <p className="text-xs uppercase text-zinc-500">Pontos disponíveis</p>
              <p className="text-lg font-semibold text-white">{me.points.availablePoints}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-zinc-500">Pontos utilizados</p>
              <p className="text-lg font-semibold text-white">{me.points.usedPoints}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <NeonButton type="button" variant="ghost">
              Editar perfil
            </NeonButton>
            <NeonButton type="button" variant="ghost">
              Alterar senha
            </NeonButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
