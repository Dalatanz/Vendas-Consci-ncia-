"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BrandLogo } from "@/components/BrandLogo";
import { NeonButton } from "@/components/NeonButton";
import { NeonInput } from "@/components/NeonInput";

function RecuperarForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = params.get("token")?.trim();
    if (t) setToken(t);
  }, [params]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (password !== password2) {
      setErr("As senhas não conferem.");
      return;
    }
    if (!token) {
      setErr("Informe o token recebido por e-mail.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error ?? "Erro ao redefinir.");
        return;
      }
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <NeonInput
        label="Token (preenchido automaticamente pelo link)"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        required
      />
      <NeonInput
        label="Nova senha"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <NeonInput
        label="Confirmar nova senha"
        type="password"
        value={password2}
        onChange={(e) => setPassword2(e.target.value)}
        required
      />
      {err ? <p className="text-center text-sm text-red-400">{err}</p> : null}
      <NeonButton type="submit" className="w-full py-3" disabled={loading}>
        {loading ? "Salvando…" : "Redefinir senha"}
      </NeonButton>
    </form>
  );
}

export default function RecuperarSenhaPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <div className="glass-panel rounded-3xl p-8">
        <div className="mb-6 flex justify-center">
          <BrandLogo />
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-center text-2xl font-semibold text-white">
          Nova senha
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-500">Use o token recebido por e-mail.</p>
        <Suspense fallback={<p className="mt-8 text-center text-zinc-500">Carregando…</p>}>
          <RecuperarForm />
        </Suspense>
        <p className="mt-6 text-center text-sm">
          <Link href="/login" className="text-[var(--uvc-neon)] hover:underline">
            Voltar ao login
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
