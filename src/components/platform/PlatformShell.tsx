"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Award,
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Gift,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  X,
  Coins,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import type { AssociatedCompany } from "@/generated/prisma/enums";

const companyLabel: Record<AssociatedCompany, string> = {
  SIMPLIFICA: "Simplifica",
  SCALE: "Scale",
  OTHER: "Outra",
};

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trilha", label: "Trilha de desenvolvimento", icon: BookOpen },
  { href: "/eventos", label: "Eventos", icon: CalendarDays },
  { href: "/avaliacoes", label: "Avaliações", icon: ClipboardCheck },
  { href: "/pontos", label: "Meus pontos", icon: Coins },
  { href: "/recompensas", label: "Recompensas", icon: Gift },
  { href: "/biblioteca", label: "Biblioteca virtual", icon: GraduationCap },
  { href: "/diplomas", label: "Diplomas e certificados", icon: Award },
  { href: "/perfil", label: "Meu perfil", icon: User },
];

function PlatformNav({
  compact,
  user,
  onNavigate,
  onLogout,
}: {
  compact: boolean;
  user: { name: string; company: AssociatedCompany };
  onNavigate?: () => void;
  onLogout: () => void;
}) {
  const pathname = usePathname();
  return (
    <>
      <div className="mb-8 flex items-center justify-between gap-2 px-2">
        {!compact && (
          <div>
            <p className="font-[family-name:var(--font-display)] text-xs uppercase tracking-[0.2em] text-[var(--uvc-neon)]">
              UVC
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="truncate text-xs text-zinc-500">{companyLabel[user.company]}</p>
          </div>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {nav.map((item) => {
          const active =
            pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
                active
                  ? "bg-[color-mix(in_srgb,var(--uvc-neon)_16%,transparent)] text-[var(--uvc-neon)] shadow-[0_0_20px_color-mix(in_srgb,var(--uvc-neon)_12%,transparent)]"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white",
                compact && "justify-center px-2",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110",
                  active && "text-[var(--uvc-neon)] drop-shadow-[0_0_8px_color-mix(in_srgb,var(--uvc-neon)_60%,transparent)]",
                )}
              />
              {!compact && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={onLogout}
        className={cn(
          "mt-6 flex items-center gap-3 rounded-xl border border-white/10 px-3 py-2.5 text-sm text-zinc-400 transition hover:border-red-500/40 hover:bg-red-500/5 hover:text-red-300",
          compact && "justify-center",
        )}
      >
        <LogOut className="h-5 w-5 shrink-0" />
        {!compact && "Sair"}
      </button>
    </>
  );
}

export function PlatformShell({
  user,
  children,
}: {
  user: { name: string; company: AssociatedCompany };
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-full border-r border-white/5 bg-[#050505] transition-[width] duration-300 lg:block",
          collapsed ? "w-[84px]" : "w-[272px]",
        )}
      >
        <div className="flex h-full flex-col p-4">
          <div className="mb-2 hidden justify-end lg:flex">
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="rounded-lg border border-white/10 p-2 text-zinc-400 transition hover:border-[var(--uvc-neon)] hover:text-[var(--uvc-neon)]"
              aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>
          <PlatformNav compact={collapsed} user={user} onLogout={logout} />
        </div>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: mobileOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="fixed left-0 top-0 z-50 flex h-full w-[min(88vw,300px)] flex-col border-r border-white/10 bg-[#050505] p-4 lg:hidden"
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="font-[family-name:var(--font-display)] text-sm font-semibold text-[var(--uvc-neon)]">
            Menu
          </span>
          <button
            type="button"
            className="rounded-lg p-2 text-zinc-400 hover:text-white"
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>
        <PlatformNav
          compact={false}
          user={user}
          onNavigate={() => setMobileOpen(false)}
          onLogout={logout}
        />
      </motion.aside>

      <div
        className={cn(
          "flex min-h-screen flex-1 flex-col transition-[padding] duration-300",
          collapsed ? "lg:pl-[84px]" : "lg:pl-[272px]",
        )}
      >
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/5 bg-black/80 px-4 py-3 backdrop-blur-md lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-white/10 p-2 text-zinc-300 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={22} />
            </button>
            <div className="hidden items-center gap-2 text-xs text-zinc-500 lg:flex">
              <BarChart3 className="h-4 w-4 text-[var(--uvc-neon)]" />
              <span className="uppercase tracking-widest">Performance & evolução</span>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300">
            <span className="hidden sm:inline">Engajamento ativo</span>
            <span className="h-1.5 w-1.5 animate-pulse-neon rounded-full bg-[var(--uvc-neon)] shadow-[0_0_12px_var(--uvc-neon)]" />
          </div>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
