"use client";

import { useEffect, useState } from "react";
import { Lock, Unlock, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { NeonButton } from "@/components/NeonButton";
import { NeonInput } from "@/components/NeonInput";

type Row = {
  id: string;
  title: string;
  moduleTitle: string;
  locked: boolean;
  status: "bloqueada" | "liberada" | "concluida";
  scorePct: number | null;
  passed: boolean | null;
};

export default function AvaliacoesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [correct, setCorrect] = useState("6");
  const [msg, setMsg] = useState("");

  async function refresh() {
    const r = await fetch("/api/assessments");
    const d = await r.json();
    setRows(d.assessments ?? []);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function submit(id: string) {
    setMsg("");
    const n = Math.max(0, Math.min(50, Number(correct)));
    const res = await fetch(`/api/assessments/${id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correctCount: n }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(data.error ?? "Erro");
      return;
    }
    setMsg(`Nota simulada: ${data.scorePct}% — ${data.passed ? "Aprovado" : "Reprovado"}`);
    setOpen(null);
    await refresh();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white">
          Avaliações
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          As avaliações serão disponibilizadas conforme a conclusão das aulas de cada módulo.
        </p>
      </div>

      <div className="grid gap-4">
        {rows.map((a) => (
          <GlassCard key={a.id} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-3">
              <div className="mt-1">
                {a.locked ? (
                  <Lock className="h-5 w-5 text-zinc-600" />
                ) : a.status === "concluida" ? (
                  <CheckCircle2 className="h-5 w-5 text-[var(--uvc-neon)]" />
                ) : (
                  <Unlock className="h-5 w-5 text-sky-400" />
                )}
              </div>
              <div>
                <p className="text-xs text-zinc-500">{a.moduleTitle}</p>
                <h2 className="font-semibold text-white">{a.title}</h2>
                <p className="mt-1 text-xs text-zinc-500">
                  {a.locked
                    ? "Bloqueada — conclua todas as aulas do módulo."
                    : a.status === "concluida"
                      ? `Concluída — ${a.scorePct}% — ${a.passed ? "Aprovado" : "Reprovado"}`
                      : "Liberada — pronta para realizar."}
                </p>
              </div>
            </div>
            {!a.locked && a.status !== "concluida" && (
              <NeonButton type="button" variant="ghost" onClick={() => setOpen(a.id)}>
                Iniciar / registrar resultado
              </NeonButton>
            )}
            {a.status === "concluida" && !a.passed && (
              <NeonButton type="button" variant="ghost" onClick={() => setOpen(a.id)}>
                Tentar novamente
              </NeonButton>
            )}
          </GlassCard>
        ))}
      </div>

      {open && (
        <GlassCard className="border-[color-mix(in_srgb,var(--uvc-neon)_40%,transparent)]">
          <h3 className="font-semibold text-white">Simulação de avaliação (10 questões)</h3>
          <p className="mt-2 text-xs text-zinc-500">
            Informe quantas questões acertou. Acima de 50% aprova e pode gerar +1 ponto (sem
            duplicidade).
          </p>
          <div className="mt-4 max-w-xs">
            <NeonInput
              label="Questões corretas (0–10)"
              value={correct}
              onChange={(e) => setCorrect(e.target.value)}
            />
          </div>
          {msg ? <p className="mt-3 text-sm text-[var(--uvc-neon)]">{msg}</p> : null}
          <div className="mt-4 flex gap-2">
            <NeonButton type="button" onClick={() => submit(open)}>
              Enviar
            </NeonButton>
            <NeonButton type="button" variant="ghost" onClick={() => setOpen(null)}>
              Cancelar
            </NeonButton>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
