"use client";

import { useEffect, useState } from "react";
import { Award, Lock } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { NeonButton } from "@/components/NeonButton";

export default function DiplomasPage() {
  const [assessments, setAssessments] = useState<
    { id: string; title: string; moduleTitle: string; status: string; scorePct: number | null; passed: boolean | null }[]
  >([]);

  useEffect(() => {
    fetch("/api/assessments")
      .then((r) => r.json())
      .then((d) => setAssessments(d.assessments ?? []))
      .catch(() => setAssessments([]));
  }, []);

  const allModulesPassed =
    assessments.length > 0 && assessments.every((a) => a.status === "concluida" && a.passed);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white">
          Diplomas e certificados
        </h1>
        <p className="mt-2 max-w-xl text-sm text-zinc-400">
          Os certificados serão disponibilizados após a conclusão e aprovação em cada módulo.
        </p>
        <p className="mt-2 max-w-xl text-sm text-zinc-500">
          O diploma final será liberado quando todos os módulos forem concluídos e aprovados.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {assessments.map((a) => {
          const issued = a.status === "concluida" && a.passed;
          return (
            <GlassCard key={a.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-zinc-500">{a.moduleTitle}</p>
                  <h2 className="mt-1 font-semibold text-white">Certificado — {a.title}</h2>
                  <p className="mt-2 text-xs text-zinc-500">
                    Status:{" "}
                    {issued ? (
                      <span className="text-[var(--uvc-neon)]">Emitido (simulado)</span>
                    ) : (
                      <span className="text-zinc-400">Pendente de aprovação no módulo</span>
                    )}
                  </p>
                </div>
                {issued ? (
                  <Award className="h-8 w-8 text-[var(--uvc-neon)]" />
                ) : (
                  <Lock className="h-8 w-8 text-zinc-600" />
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <NeonButton type="button" variant="ghost" disabled={!issued} className="gap-2">
                  Visualizar PDF
                </NeonButton>
                <NeonButton type="button" disabled={!issued}>
                  Download PDF
                </NeonButton>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <GlassCard>
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
          Diploma final
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          {allModulesPassed
            ? "Parabéns — trilha integral concluída com aprovações. Diploma liberado (simulado)."
            : "Complete e seja aprovado em todos os módulos para liberar o diploma final."}
        </p>
        <NeonButton type="button" className="mt-4" disabled={!allModulesPassed}>
          Baixar diploma final
        </NeonButton>
      </GlassCard>
    </div>
  );
}
