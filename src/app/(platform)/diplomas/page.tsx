"use client";

import { useEffect, useState } from "react";
import { Award, Lock } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { NeonButton } from "@/components/NeonButton";

type Cert = {
  id: string;
  title: string;
  type: string;
  status: string;
  issuedAt: string | null;
  downloadable: boolean;
};

export default function DiplomasPage() {
  const [certs, setCerts] = useState<Cert[]>([]);

  useEffect(() => {
    fetch("/api/certificates")
      .then((r) => r.json())
      .then((d) => setCerts(d.certificates ?? []))
      .catch(() => setCerts([]));
  }, []);

  const finalCert = certs.find((c) => c.type === "FINAL");
  const moduleCerts = certs.filter((c) => c.type === "MODULE");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white">
          Diplomas e certificados
        </h1>
        <p className="mt-2 max-w-xl text-sm text-zinc-400">
          Os certificados são emitidos automaticamente após aprovação nas avaliações de cada módulo.
        </p>
        <p className="mt-2 max-w-xl text-sm text-zinc-500">
          O diploma final é liberado quando todos os módulos forem concluídos e aprovados.
        </p>
      </div>

      {moduleCerts.length === 0 ? (
        <GlassCard>
          <p className="text-sm text-zinc-400">
            Nenhum certificado de módulo emitido ainda. Aprove as avaliações após concluir cada módulo.
          </p>
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {moduleCerts.map((c) => (
            <GlassCard key={c.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-white">{c.title}</h2>
                  <p className="mt-2 text-xs text-zinc-500">
                    Status:{" "}
                    {c.downloadable ? (
                      <span className="text-[var(--uvc-neon)]">Emitido</span>
                    ) : (
                      <span className="text-zinc-400">Pendente de aprovação no módulo</span>
                    )}
                  </p>
                  {c.issuedAt ? (
                    <p className="mt-1 text-[11px] text-zinc-600">
                      {new Date(c.issuedAt).toLocaleString("pt-BR")}
                    </p>
                  ) : null}
                </div>
                {c.downloadable ? (
                  <Award className="h-8 w-8 text-[var(--uvc-neon)]" />
                ) : (
                  <Lock className="h-8 w-8 text-zinc-600" />
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={`/api/certificates/${c.id}/pdf?inline=1`} target="_blank" rel="noreferrer">
                  <NeonButton type="button" variant="ghost" disabled={!c.downloadable}>
                    Visualizar PDF
                  </NeonButton>
                </a>
                <a href={`/api/certificates/${c.id}/pdf`} download>
                  <NeonButton type="button" disabled={!c.downloadable}>
                    Download PDF
                  </NeonButton>
                </a>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <GlassCard>
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
          Diploma final
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          {finalCert?.downloadable
            ? "Parabéns — trilha integral concluída com aprovações. Seu diploma está disponível."
            : "Complete e seja aprovado em todos os módulos para liberar o diploma final."}
        </p>
        {finalCert ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={`/api/certificates/${finalCert.id}/pdf?inline=1`} target="_blank" rel="noreferrer">
              <NeonButton type="button" variant="ghost" disabled={!finalCert.downloadable}>
                Visualizar PDF
              </NeonButton>
            </a>
            <a href={`/api/certificates/${finalCert.id}/pdf`} download>
              <NeonButton type="button" disabled={!finalCert.downloadable}>
                Baixar diploma final
              </NeonButton>
            </a>
          </div>
        ) : null}
      </GlassCard>
    </div>
  );
}
