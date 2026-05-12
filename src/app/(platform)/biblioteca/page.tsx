"use client";

import { useEffect, useState } from "react";
import { Lock, FileText, Download } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { NeonButton } from "@/components/NeonButton";

export default function BibliotecaPage() {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    fetch("/api/modules")
      .then((r) => r.json())
      .then((d) => {
        const intro = d.modules?.find((m: { slug: string }) => m.slug === "introducao");
        setUnlocked(intro && intro.progressPct >= 100);
      })
      .catch(() => setUnlocked(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white">
          Biblioteca virtual
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Os conteúdos da biblioteca virtual serão disponibilizados após a conclusão do módulo de
          introdução.
        </p>
      </div>

      {!unlocked ? (
        <GlassCard className="flex flex-col items-center py-12 text-center">
          <Lock className="h-12 w-12 text-zinc-600" />
          <p className="mt-4 max-w-md text-sm text-zinc-400">
            Área bloqueada até finalizar o módulo de introdução. Complete todas as aulas para
            liberar PDFs, e-books e materiais de apoio.
          </p>
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {["PDF — Scripts de abordagem", "E-book — Consciência comercial", "Material — Objeções"].map(
            (t) => (
              <GlassCard key={t}>
                <FileText className="h-8 w-8 text-[var(--uvc-neon)]" />
                <h2 className="mt-3 font-semibold text-white">{t}</h2>
                <p className="mt-2 text-xs text-zinc-500">Download exclusivo para alunos avançados.</p>
                <NeonButton type="button" variant="ghost" className="mt-4 gap-2">
                  <Download className="h-4 w-4" />
                  Baixar
                </NeonButton>
              </GlassCard>
            ),
          )}
        </div>
      )}
    </div>
  );
}
