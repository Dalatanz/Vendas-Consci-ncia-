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
          Módulos estruturados para evolução contínua em vendas e consciência comercial. Os vídeos
          estão nesta estrutura — progresso e conclusão alimentam o dashboard e a gamificação.
        </p>
      </div>

      {modules.length === 0 ? (
        <GlassCard className="max-w-2xl border-amber-500/25 bg-amber-500/5">
          <p className="text-sm font-medium text-amber-100/90">Nenhum módulo encontrado</p>
          <p className="mt-2 text-sm text-zinc-400">
            O banco de dados ainda não tem a trilha cadastrada. Quem administra o projeto precisa
            rodar o seed <strong>uma vez</strong> apontando para o mesmo Postgres de produção:
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg border border-white/10 bg-black/50 p-3 text-xs text-zinc-300">
            cd web{"\n"}
            npx prisma db seed
          </pre>
          <p className="mt-3 text-xs text-zinc-500">
            Depois disso, atualize esta página. Se os vídeos do Drive já estiverem no código ou na
            variável <code className="text-zinc-400">DRIVE_MODULE_VIDEO_IDS</code>, rode também{" "}
            <code className="text-zinc-400">npm run db:sync-videos</code> para gravar as URLs nas
            aulas.
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
