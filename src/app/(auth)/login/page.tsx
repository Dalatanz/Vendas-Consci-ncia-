"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { BrandLogo } from "@/components/BrandLogo";
import { NeonButton } from "@/components/NeonButton";
import { NeonInput } from "@/components/NeonInput";
import { formatCpfInput, digitsOnly } from "@/lib/masks";

export default function LoginPage() {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: digitsOnly(cpf), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Não foi possível entrar.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="w-full max-w-md"
    >
      <div className="glass-panel rounded-3xl p-8 shadow-[0_0_60px_rgba(0,0,0,0.65)]">
        <div className="mb-8 flex justify-center">
          <BrandLogo />
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-center text-2xl font-semibold tracking-tight text-white">
          Acesse sua evolução
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-500">
          Universidade Vendas Consciência — performance, consciência e resultados.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <NeonInput
            label="CPF"
            placeholder="000.000.000-00"
            autoComplete="username"
            value={cpf}
            onChange={(e) => setCpf(formatCpfInput(e.target.value))}
          />
          <NeonInput
            label="Senha"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error ? <p className="text-center text-sm text-red-400">{error}</p> : null}
          <NeonButton type="submit" className="w-full py-3 text-base" disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </NeonButton>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-center text-sm">
          <Link href="/esqueci-senha" className="text-zinc-500 transition hover:text-[var(--uvc-neon)]">
            Esqueci minha senha
          </Link>
          <Link href="/cadastro" className="font-medium text-[var(--uvc-neon)] hover:underline">
            Criar conta
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
