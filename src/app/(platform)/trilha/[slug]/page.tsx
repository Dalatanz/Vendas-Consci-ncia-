import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, Lock, Play } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { NeonButton } from "@/components/NeonButton";
import { getUserIdOrNull } from "@/lib/session";
import { getModuleDetailForUser } from "@/lib/trail-modules";

type PageProps = { params: Promise<{ slug: string }> };

export default async function ModuloPage({ params }: PageProps) {
  const { slug } = await params;
  const userId = await getUserIdOrNull();
  if (!userId) {
    redirect("/login");
  }

  const data = await getModuleDetailForUser(userId, slug);
  if (!data) {
    notFound();
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
        <p className="mt-3 max-w-2xl border-l-2 border-[color-mix(in_srgb,var(--uvc-neon)_50%,transparent)] pl-3 text-xs text-zinc-500">
          Neste módulo, assista na ordem: a <strong className="text-zinc-300">aula 1</strong> fica
          liberada; as seguintes liberam depois que você{" "}
          <strong className="text-zinc-300">marcar a anterior como concluída</strong> (no player).
          Funciona igual na Vercel — só depende do seed no banco e das URLs dos vídeos.
        </p>
        <div className="mt-4 h-2 max-w-md overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-[var(--uvc-neon)]"
            style={{ width: `${data.module.progressPct}%` }}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {data.lessons.map((l) => (
          <GlassCard
            key={l.id}
            className={`flex flex-col justify-between ${l.locked ? "opacity-80" : ""}`}
          >
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                Aula {l.order}
                {l.locked ? (
                  <span className="ml-2 inline-flex items-center gap-1 text-amber-400/90">
                    <Lock className="h-3 w-3" />
                    Bloqueada
                  </span>
                ) : null}
              </p>
              <h2 className="mt-1 text-lg font-semibold text-white">{l.title}</h2>
              <p className="mt-2 text-xs text-zinc-500">
                {l.locked
                  ? l.lockReason ?? "Conclua a aula anterior."
                  : l.completed
                    ? "Concluída"
                    : `Progresso ${Math.round(l.progressPct)}%`}
              </p>
            </div>
            {l.locked ? (
              <div className="mt-4">
                <NeonButton type="button" className="w-full gap-2" disabled>
                  <Lock className="h-4 w-4" />
                  Assistir
                </NeonButton>
              </div>
            ) : (
              <Link href={`/trilha/${slug}/${l.id}`} className="mt-4">
                <NeonButton type="button" className="w-full gap-2">
                  <Play className="h-4 w-4" />
                  Assistir
                </NeonButton>
              </Link>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
