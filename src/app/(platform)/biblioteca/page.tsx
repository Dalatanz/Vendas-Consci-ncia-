"use client";

import { useEffect, useState } from "react";
import { Lock, FileText, Download } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { NeonButton } from "@/components/NeonButton";

type FileRow = { id: string; title: string; description: string; path: string };

export default function BibliotecaPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [files, setFiles] = useState<FileRow[]>([]);

  useEffect(() => {
    fetch("/api/biblioteca")
      .then((r) => r.json())
      .then((d) => {
        setUnlocked(Boolean(d.unlocked));
        setFiles(d.files ?? []);
      })
      .catch(() => {
        setUnlocked(false);
        setFiles([]);
      });
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
            Área bloqueada até finalizar o módulo de introdução. Complete todas as aulas para liberar
            materiais de apoio.
          </p>
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {files.map((f) => (
            <GlassCard key={f.id}>
              <FileText className="h-8 w-8 text-[var(--uvc-neon)]" />
              <h2 className="mt-3 font-semibold text-white">{f.title}</h2>
              <p className="mt-2 text-xs text-zinc-500">{f.description}</p>
              <a href={f.path} download className="mt-4 inline-block">
                <NeonButton type="button" variant="ghost" className="gap-2">
                  <Download className="h-4 w-4" />
                  Baixar
                </NeonButton>
              </a>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
