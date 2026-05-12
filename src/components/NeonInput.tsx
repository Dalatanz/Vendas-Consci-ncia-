"use client";

import { cn } from "@/lib/cn";
import type { InputHTMLAttributes } from "react";

export function NeonInput({
  className,
  label,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <label className="block w-full">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--uvc-muted)]">
        {label}
      </span>
      <div className="neon-border-focus rounded-xl transition-shadow duration-300">
        <input
          className={cn(
            "w-full rounded-xl border border-[color-mix(in_srgb,var(--uvc-neon)_18%,transparent)] bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none ring-0 placeholder:text-zinc-600 focus:border-[var(--uvc-neon)]",
            error && "border-red-500/60",
            className,
          )}
          {...props}
        />
      </div>
      {error ? <p className="mt-1 text-xs text-red-400">{error}</p> : null}
    </label>
  );
}
