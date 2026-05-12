import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, ChevronRight, Clock } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { getUserIdOrNull } from "@/lib/session";
import { getTrailModulesForUser } from "@/lib/trail-modules";

export default async function TrilhaPage() {
  const userId = await getUserIdOrNull();
  if (!userId) {
    redirect("/login");
  }

  const modules = await getTrailModulesForUser(userId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white">
          Trilha de desenvolvimento
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          Aqui você vê a <strong className="font-medium text-zinc-300">lista de módulos</strong>.
          Abra um módulo para ver as aulas em ordem: a primeira já libera; as próximas liberam ao
          marcar a anterior como concluída no player. Na primeira visita, a trilha é criada
          automaticamente no banco se ainda não existir (também no deploy Vercel com{" "}
          <code className="text-zinc-500">build:vercel</code>).
        </p>
      </div>

      {modules.length === 0 ? (
        <GlassCard className="max-w-2xl border-amber-500/25 bg-amber-500/5">
          <p className="text-sm font-medium text-amber-100/90">Nenhum módulo encontrado</p>
          <p className="mt-2 text-sm text-zinc-400">
            Isso é incomum: a trilha deveria ser criada sozinha ao carregar esta página. Confira se
            a variável <strong className="text-zinc-300">DATABASE_URL</strong> na Vercel aponta
            para o Postgres certo e se o deploy usa <code className="text-zinc-500">npm run build:vercel</code>{" "}
            (inclui migração + seed). Atualize a página ou faça um novo deploy.
          </p>
          <p className="mt-3 text-xs text-zinc-500">
            Opcional na sua máquina (mesmo banco de produção):{" "}
            <code className="text-zinc-400">cd web &amp;&amp; npx prisma db seed</code> — e{" "}
            <code className="text-zinc-400">npm run db:sync-videos</code> para gravar URLs do Drive
            nas aulas.
          </p>
        </GlassCard>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((m) => (
            <GlassCard
              key={m.slug}
              className="h-full hover:border-[color-mix(in_srgb,var(--uvc-neon)_35%,transparent)]"
            >
              <div className="flex aspect-video items-center justify-center rounded-xl bg-gradient-to-br from-zinc-900 to-black">
                <BookOpen className="h-10 w-10 text-[var(--uvc-neon)] opacity-80" />
              </div>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-lg font-semibold text-white">
                {m.title}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm text-zinc-500">{m.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                <span>{m.lessonCount} aulas</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />~{m.durationMin} min
                </span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-[var(--uvc-neon)]"
                  style={{ width: `${m.progressPct}%` }}
                />
              </div>
              <Link
                href={`/trilha/${m.slug}`}
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--uvc-neon)] hover:underline"
              >
                Abrir módulo <ChevronRight className="h-4 w-4" />
              </Link>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
