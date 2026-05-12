"use client";

import Image from "next/image";
import { useState } from "react";

export function BrandLogo({ className = "" }: { className?: string }) {
  const [useFallback, setUseFallback] = useState(false);

  if (useFallback) {
    return (
      <div
        className={`flex items-center justify-center gap-2 ${className}`}
        aria-label="Universidade Vendas Consciência"
      >
        <div className="relative h-12 w-12 shrink-0 rounded-xl border border-[color-mix(in_srgb,var(--uvc-neon)_45%,transparent)] bg-[#111] shadow-[0_0_28px_color-mix(in_srgb,var(--uvc-neon)_22%,transparent)]">
          <span className="font-[family-name:var(--font-display)] absolute inset-0 flex items-center justify-center text-lg font-bold tracking-tight text-[var(--uvc-neon)]">
            UVC
          </span>
        </div>
        <div className="text-left leading-tight">
          <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-wide text-white">
            Universidade
          </p>
          <p className="font-[family-name:var(--font-display)] text-xs font-medium tracking-[0.2em] text-[var(--uvc-neon)]">
            VENDAS CONSCIÊNCIA
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative h-14 w-auto ${className}`}>
      <Image
        src="/logo.png"
        alt="Universidade Vendas Consciência"
        width={280}
        height={56}
        className="h-14 w-auto object-contain"
        priority
        onError={() => setUseFallback(true)}
      />
    </div>
  );
}
