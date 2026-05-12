"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { BrandLogo } from "@/components/BrandLogo";
import { NeonButton } from "@/components/NeonButton";
import { NeonInput } from "@/components/NeonInput";
import { formatCpfInput, digitsOnly } from "@/lib/masks";

export default function EsqueciSenhaPage() {
  const [cpf, setCpf] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: digitsOnly(cpf) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error ?? "Não foi possível enviar.");
        return;
      }
      setMsg(data.message ?? "Verifique seu e-mail.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <div className="glass-panel rounded-3xl p-8">
        <div className="mb-6 flex justify-center">
          <BrandLogo />
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-center text-2xl font-semibold text-white">
          Esqueci minha senha
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-500">
          Informe seu CPF. Se houver e-mail cadastrado no perfil, enviaremos o link de redefinição (via
          Resend).
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <NeonInput label="CPF" value={cpf} onChange={(e) => setCpf(formatCpfInput(e.target.value))} required />
          {err ? <p className="text-center text-sm text-red-400">{err}</p> : null}
          {msg ? <p className="text-center text-sm text-[var(--uvc-neon)]">{msg}</p> : null}
          <NeonButton type="submit" className="w-full py-3" disabled={loading}>
            {loading ? "Enviando…" : "Enviar link"}
          </NeonButton>
        </form>
        <p className="mt-6 text-center text-sm">
          <Link href="/login" className="text-[var(--uvc-neon)] hover:underline">
            Voltar ao login
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
