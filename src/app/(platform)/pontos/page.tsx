"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/GlassCard";

type Tx = {
  id: string;
  points: number;
  type: string;
  description: string | null;
  createdAt: string;
};

export default function PontosPage() {
  const [wallet, setWallet] = useState({ totalPoints: 0, availablePoints: 0, usedPoints: 0 });
  const [history, setHistory] = useState<Tx[]>([]);

  useEffect(() => {
    fetch("/api/points")
      .then((r) => r.json())
      .then((d) => {
        setWallet(d.wallet ?? wallet);
        setHistory(d.history ?? []);
      })
      .catch(() => {});
  }, []);

  const label = (t: string) => {
    if (t === "lesson_completed") return "Aula concluída";
    if (t === "activity_passed") return "Atividade aprovada";
    if (t === "event_attendance") return "Evento";
    if (t === "manual_bonus") return "Bônus manual";
    if (t === "reward_redeemed") return "Resgate / débito";
    return t;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white">
          Meus pontos
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Saldo, histórico e movimentações — cada ponto registrado com data e origem.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard>
          <p className="text-xs uppercase tracking-widest text-zinc-500">Saldo total ganho</p>
          <p className="mt-2 text-3xl font-bold text-white">{wallet.totalPoints}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs uppercase tracking-widest text-zinc-500">Disponíveis</p>
          <p className="mt-2 text-3xl font-bold text-[var(--uvc-neon)]">{wallet.availablePoints}</p>
        </GlassCard>
        <GlassCard>
          <p className="text-xs uppercase tracking-widest text-zinc-500">Já utilizados</p>
          <p className="mt-2 text-3xl font-bold text-zinc-300">{wallet.usedPoints}</p>
        </GlassCard>
      </div>

      <GlassCard>
        <h2 className="font-semibold text-white">Histórico</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase text-zinc-500">
                <th className="py-2 pr-4">Data</th>
                <th className="py-2 pr-4">Pontos</th>
                <th className="py-2 pr-4">Origem</th>
                <th className="py-2">Detalhe</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-b border-white/5 text-zinc-300">
                  <td className="py-2 pr-4 whitespace-nowrap text-xs">
                    {new Date(h.createdAt).toLocaleString("pt-BR")}
                  </td>
                  <td className={`py-2 pr-4 font-mono ${h.points < 0 ? "text-red-400" : "text-[var(--uvc-neon)]"}`}>
                    {h.points > 0 ? `+${h.points}` : h.points}
                  </td>
                  <td className="py-2 pr-4 text-xs">{label(h.type)}</td>
                  <td className="py-2 text-xs text-zinc-500">{h.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {history.length === 0 ? (
            <p className="mt-4 text-center text-sm text-zinc-500">Nenhuma movimentação ainda.</p>
          ) : null}
        </div>
      </GlassCard>
    </div>
  );
}
