"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { NeonButton } from "@/components/NeonButton";
import { NeonInput } from "@/components/NeonInput";
import { levelFromTotalPoints, xpProgressInLevel } from "@/lib/gamification";
import { formatPhoneInput, digitsOnly } from "@/lib/masks";

type Me = {
  name: string;
  email: string | null;
  cpfMasked: string;
  phone: string;
  company: string;
  avatarUrl: string | null;
  points: { totalPoints: number; availablePoints: number; usedPoints: number };
};

export default function PerfilPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const r = await fetch("/api/me");
    const d = await r.json();
    if (!r.ok) return;
    setMe(d);
    setName(d.name);
    setEmail(d.email ?? "");
    setPhone(formatPhoneInput(d.phone ?? ""));
  }

  useEffect(() => {
    load();
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: digitsOnly(phone),
          email: email.trim() || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error ?? "Erro ao salvar.");
        return;
      }
      setMsg("Perfil atualizado.");
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (newPw !== newPw2) {
      setErr("As novas senhas não conferem.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error ?? "Erro ao alterar senha.");
        return;
      }
      setMsg("Senha alterada com sucesso.");
      setCurPw("");
      setNewPw("");
      setNewPw2("");
    } finally {
      setLoading(false);
    }
  }

  if (!me) {
    return <p className="text-zinc-500">Carregando perfil…</p>;
  }

  const lvl = levelFromTotalPoints(me.points.totalPoints);
  const xp = xpProgressInLevel(me.points.totalPoints);

  return (
    <div className="space-y-8">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-white">
        Meu perfil
      </h1>

      {err ? <p className="text-sm text-red-400">{err}</p> : null}
      {msg ? <p className="text-sm text-[var(--uvc-neon)]">{msg}</p> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="flex flex-col items-center text-center lg:col-span-1">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-[var(--uvc-neon)] bg-zinc-900">
            {me.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={me.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              <User className="h-12 w-12 text-zinc-500" />
            )}
          </div>
          <h2 className="mt-4 text-xl font-semibold text-white">{me.name}</h2>
          <p className="text-sm text-[var(--uvc-neon)]">{me.company}</p>
          <p className="mt-2 text-xs text-zinc-500">CPF: {me.cpfMasked}</p>
          <p className="text-xs text-zinc-500">Telefone: {formatPhoneInput(me.phone)}</p>
          {me.email ? <p className="text-xs text-zinc-500">E-mail: {me.email}</p> : null}
        </GlassCard>

        <GlassCard className="lg:col-span-2">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
            Evolução
          </h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-zinc-500">Nível</p>
              <p className="text-2xl font-bold text-white">{lvl.label}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-zinc-500">XP (pontos totais)</p>
              <p className="text-2xl font-bold text-[var(--uvc-neon)]">{me.points.totalPoints}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs uppercase text-zinc-500">Progresso até próximo nível</p>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-[var(--uvc-neon)]"
                  style={{ width: `${xp.pct}%` }}
                />
              </div>
            </div>
            <div>
              <p className="text-xs uppercase text-zinc-500">Pontos disponíveis</p>
              <p className="text-lg font-semibold text-white">{me.points.availablePoints}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-zinc-500">Pontos utilizados</p>
              <p className="text-lg font-semibold text-white">{me.points.usedPoints}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard>
          <h3 className="font-semibold text-white">Editar perfil</h3>
          <form onSubmit={saveProfile} className="mt-4 space-y-4">
            <NeonInput label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} required />
            <NeonInput
              label="Telefone (DDD)"
              value={phone}
              onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
              required
            />
            <NeonInput
              label="E-mail (recuperação de senha)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <NeonButton type="submit" disabled={loading}>
              Salvar alterações
            </NeonButton>
          </form>
        </GlassCard>

        <GlassCard>
          <h3 className="font-semibold text-white">Alterar senha</h3>
          <form onSubmit={savePassword} className="mt-4 space-y-4">
            <NeonInput
              label="Senha atual"
              type="password"
              value={curPw}
              onChange={(e) => setCurPw(e.target.value)}
              required
            />
            <NeonInput
              label="Nova senha"
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              required
            />
            <NeonInput
              label="Confirmar nova senha"
              type="password"
              value={newPw2}
              onChange={(e) => setNewPw2(e.target.value)}
              required
            />
            <NeonButton type="submit" disabled={loading}>
              Atualizar senha
            </NeonButton>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
