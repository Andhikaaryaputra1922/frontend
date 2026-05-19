"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, ReactNode } from "react";
import { PremiumModal } from "@/shared/components/ui/PremiumFeedback";
import { LogOut, Settings, HelpCircle, ChevronLeft, ChevronRight, Clock } from "lucide-react";

export interface NavItem {
  label: string;
  icon: ReactNode;
  href: string;
}

interface BaseSidebarProps {
  /** Display name of the user */
  name?: string;
  /** User email */
  email?: string;
  /** Role label shown under avatar */
  roleLabel?: string;
  /** Home href (logo link) */
  homeHref: string;
  /** Main navigation items */
  navItems: NavItem[];
  /** Settings page href */
  settingsHref: string;
  /** Logout modal message */
  logoutMessage?: string;
  /** Optional help button handler */
  onHelp?: () => void;
}

export default function BaseSidebar({
  name,
  email,
  roleLabel = "User",
  homeHref,
  navItems,
  settingsHref,
  logoutMessage = "Yakin ingin keluar?",
  onHelp,
}: BaseSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1_000);
    return () => clearInterval(timer);
  }, []);

  const W = collapsed ? 72 : 220;

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      if (res.ok) { router.push("/login"); router.refresh(); }
    } catch { alert("Gagal logout"); }
    finally { setLogoutLoading(false); setShowLogoutModal(false); }
  };

  const initials = name
    ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
    : roleLabel.slice(0, 2).toUpperCase();

  const isActive = (href: string) =>
    pathname === href || (href !== homeHref && pathname.startsWith(href));

  return (
    <>
      <PremiumModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Logout"
        message={logoutMessage}
        type="logout"
        confirmText="Logout"
        loading={logoutLoading}
      />

      {/* ── Sidebar ── */}
      <aside
        style={{ width: `${W}px`, transition: "width 0.3s ease" }}
        className="fixed left-0 top-0 z-30 flex h-screen flex-col bg-[#0B213F] overflow-hidden shadow-[4px_0_24px_rgba(0,0,0,0.15)] border-r border-white/5"
      >
        {/* ── Logo ── */}
        <div className={`flex h-24 shrink-0 items-center justify-center overflow-hidden border-b border-white/5 ${collapsed ? "px-2" : "px-0"}`}>
          <Link href={homeHref} className="relative h-20 w-full flex items-center justify-center">
            <img
              src="/images/logo.svg"
              alt="Haneen Academy"
              className={`w-full h-full object-contain transition-all duration-500 ${collapsed ? "scale-150" : "scale-[3.5]"}`}
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </Link>
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2 scrollbar-none">
          {navItems.map(item => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`
                  group relative flex items-center gap-3 rounded-lg px-2.5 py-2.5
                  transition-all duration-200
                  ${active
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:bg-white/5 hover:text-white/80"
                  }
                `}
              >
                {/* Gold active bar */}
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-[#D4AF37]" />
                )}

                {/* Icon */}
                <span className={`shrink-0 ${active ? "text-white" : "text-white/40 group-hover:text-white/70"} transition-colors`}>
                  {item.icon}
                </span>

                {/* Label */}
                {!collapsed && (
                  <span className={`text-[12px] font-semibold truncate transition-colors ${active ? "text-white" : ""}`}>
                    {item.label}
                  </span>
                )}

                {/* Tooltip for collapsed */}
                {collapsed && (
                  <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-slate-800 px-2.5 py-1.5 text-[11px] font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Clock widget ── */}
        {mounted && now && (
          !collapsed ? (
            <div className="mx-2 mb-2 rounded-xl overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(255,255,255,0.03) 100%)", border: "1px solid rgba(212,175,55,0.15)" }}>
              {/* Seconds progress bar */}
              <div className="h-[2px] w-full bg-white/5">
                <div
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-[#f0d060] transition-all duration-1000"
                  style={{ width: `${(now.getSeconds() / 60) * 100}%` }}
                />
              </div>
              <div className="px-4 py-4">
                {/* Big time */}
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-[30px] font-black text-white tabular-nums leading-none tracking-tight">
                    {now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="text-[14px] font-bold text-[#D4AF37] tabular-nums mb-1 leading-none">
                    {String(now.getSeconds()).padStart(2, "0")}
                  </span>
                </div>
                {/* Divider */}
                <div className="h-px bg-white/5 my-2.5" />
                {/* Date */}
                <p className="text-[10px] text-white/40 font-semibold capitalize tracking-wide">
                  {now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-2 mb-2 flex justify-center">
              <div className="rounded-xl w-10 h-10 flex flex-col items-center justify-center" style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)" }}>
                <span className="text-[10px] font-black text-white tabular-nums leading-none">
                  {now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          )
        )}

        {/* ── Divider ── */}
        <div className="mx-3 border-t border-white/5" />

        {/* ── Bottom actions ── */}
        <div className="px-2 py-3 space-y-0.5">
          {/* Settings */}
          <Link
            href={settingsHref}
            title={collapsed ? "Pengaturan" : undefined}
            className="group relative flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-white/40 hover:bg-white/5 hover:text-white/80 transition-all duration-200"
          >
            <Settings size={16} className="shrink-0" />
            {!collapsed && <span className="text-[12px] font-semibold">Pengaturan</span>}
            {collapsed && (
              <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-slate-800 px-2.5 py-1.5 text-[11px] font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                Pengaturan
              </span>
            )}
          </Link>

          {/* Help (optional) */}
          {onHelp && (
            <button
              onClick={onHelp}
              title={collapsed ? "Pusat Bantuan" : undefined}
              className="group relative flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-white/40 hover:bg-white/5 hover:text-white/80 transition-all duration-200"
            >
              <HelpCircle size={16} className="shrink-0" />
              {!collapsed && <span className="text-[12px] font-semibold">Pusat Bantuan</span>}
              {collapsed && (
                <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-slate-800 px-2.5 py-1.5 text-[11px] font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                  Pusat Bantuan
                </span>
              )}
            </button>
          )}

          {/* Logout */}
          <button
            onClick={() => setShowLogoutModal(true)}
            title={collapsed ? "Keluar" : undefined}
            className="group relative flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-white/40 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200"
          >
            <LogOut size={16} className="shrink-0" />
            {!collapsed && <span className="text-[12px] font-semibold">Keluar</span>}
            {collapsed && (
              <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-slate-800 px-2.5 py-1.5 text-[11px] font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                Keluar
              </span>
            )}
          </button>
        </div>

        {/* ── User info ── */}
        <div className={`border-t border-white/5 px-3 py-3 flex items-center gap-2.5 ${collapsed ? "justify-center" : ""}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D4AF37] text-[11px] font-bold text-[#0B213F]">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-white truncate">{name || roleLabel}</p>
              <p className="text-[10px] text-white/40 truncate">{email || roleLabel}</p>
            </div>
          )}
        </div>

        {/* ── Collapse toggle ── */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3.5 top-[84px] flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#0B213F] text-white/50 hover:bg-[#D4AF37] hover:text-[#0B213F] hover:border-transparent transition-all z-[100] shadow-lg"
          style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))" }}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </aside>

      {/* ── Spacer ── */}
      <div
        style={{ width: `${W}px`, transition: "width 0.3s ease" }}
        className="hidden lg:block shrink-0"
      />
    </>
  );
}
