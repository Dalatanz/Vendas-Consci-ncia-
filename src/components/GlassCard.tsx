"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function GlassCard({
  children,
  className,
  glow = true,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "glass-panel relative overflow-hidden rounded-2xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.55)]",
        glow && "shadow-[0_0_0_1px_color-mix(in_srgb,var(--uvc-neon)_14%,transparent),0_24px_60px_rgba(0,0,0,0.55)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[color-mix(in_srgb,var(--uvc-neon)_12%,transparent)] blur-3xl" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
