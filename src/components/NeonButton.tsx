"use client";

import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function NeonButton({
  children,
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
  children: ReactNode;
}) {
  return (
    <button
      type={type}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300",
        variant === "primary" &&
          "bg-[var(--uvc-neon)] text-black shadow-[0_0_24px_color-mix(in_srgb,var(--uvc-neon)_35%,transparent)] hover:shadow-[0_0_36px_color-mix(in_srgb,var(--uvc-neon)_55%,transparent)] hover:brightness-110 active:scale-[0.98]",
        variant === "ghost" &&
          "border border-[color-mix(in_srgb,var(--uvc-neon)_35%,transparent)] bg-transparent text-white hover:bg-[color-mix(in_srgb,var(--uvc-neon)_10%,transparent)]",
        variant === "danger" && "border border-red-500/40 text-red-300 hover:bg-red-500/10",
        props.disabled && "pointer-events-none opacity-45",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
