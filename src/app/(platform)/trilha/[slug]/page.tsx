"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, Play } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { NeonButton } from "@/components/NeonButton";

type LessonRow = {
  id: string;
  title: string;
  progressPct: number;
  completed: boolean;
};

export default function ModuloPage() {
  const params = useParams();
  const slug = String(params.slug ?? "");
  const [data, setData] = useState<null | {
    module: { title: string; description: string; progressPct: number };
    lessons: LessonRow[];
  }>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/modules/${slug}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, [slug]);

  if (!data) {
    return <p className="text-zinc-500">Carregando módulo…</p>;
  }

  return (
    <div className="space-y-6">
      <Link
        href="/trilha"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-[var(--uvc-neon)]"
      >
        <ChevronLeft className="h-4 w-4" /> Voltar à trilha
      </Link>
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white">
          {data.module.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">{data.module.description}</p>
        <div className="mt-4 h-2 max-w-md overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-[var(--uvc-neon)]"
            style={{ width: `${data.module.progressPct}%` }}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {data.lessons.map((l) => (
          <GlassCard key={l.id} className="flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-500">Aula</p>
              <h2 className="mt-1 text-lg font-semibold text-white">{l.title}</h2>
              <p className="mt-2 text-xs text-zinc-500">
                {l.completed ? "Concluída" : `Progresso ${Math.round(l.progressPct)}%`}
              </p>
            </div>
            <Link href={`/trilha/${slug}/${l.id}`} className="mt-4">
              <NeonButton type="button" className="w-full gap-2">
                <Play className="h-4 w-4" />
                Assistir
              </NeonButton>
            </Link>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
