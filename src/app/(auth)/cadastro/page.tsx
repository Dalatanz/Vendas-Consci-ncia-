"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { BrandLogo } from "@/components/BrandLogo";
import { NeonButton } from "@/components/NeonButton";
import { NeonInput } from "@/components/NeonInput";
import { formatCpfInput, formatPhoneInput, digitsOnly } from "@/lib/masks";

export default function CadastroPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("Simplifica");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== password2) {
      setError("As senhas não conferem.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          cpf: digitsOnly(cpf),
          phone: digitsOnly(phone),
          company,
          password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Erro ao cadastrar.");
        return;
      }
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg"
    >
      <div className="glass-panel rounded-3xl p-8">
        <div className="mb-6 flex justify-center">
          <BrandLogo />
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-center text-2xl font-semibold text-white">
          Criar conta
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-500">
          Preencha seus dados para ingressar na plataforma.
        </p>

        <form onSubmit={onSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <NeonInput label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <NeonInput
            label="CPF"
            value={cpf}
            onChange={(e) => setCpf(formatCpfInput(e.target.value))}
            required
          />
          <NeonInput
            label="Telefone (DDD)"
            value={phone}
            onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
            required
          />
          <div className="sm:col-span-2">
            <label className="block w-full">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--uvc-muted)]">
                Empresa associada
              </span>
              <div className="neon-border-focus rounded-xl">
                <select
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full rounded-xl border border-[color-mix(in_srgb,var(--uvc-neon)_18%,transparent)] bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none focus:border-[var(--uvc-neon)]"
                >
                  <option value="Simplifica">Simplifica</option>
                  <option value="Scale">Scale</option>
                </select>
              </div>
            </label>
          </div>
          <NeonInput
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <NeonInput
            label="Confirmar senha"
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
          />
          {error ? (
            <p className="sm:col-span-2 text-center text-sm text-red-400">{error}</p>
          ) : null}
          <div className="flex flex-col gap-3 sm:col-span-2">
            <NeonButton type="submit" className="w-full py-3" disabled={loading}>
              {loading ? "Cadastrando…" : "Cadastrar"}
            </NeonButton>
            <NeonButton
              type="button"
              variant="ghost"
              className="w-full py-3"
              onClick={() => router.push("/login")}
            >
              Voltar para login
            </NeonButton>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
