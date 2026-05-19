"use client";

import React from "react";
import { Search } from "lucide-react";

/* ─── Wrapper ─────────────────────────────────────────────────── */
export default function TeacherPageLayout({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="mx-auto max-w-6xl px-6 md:px-10 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">
              Pengajar
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-[#0B213F]">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>

        {children}
      </div>
    </main>
  );
}

/* ─── Reusable sub-components ────────────────────────────────── */
export function TeacherButton({
  children,
  onClick,
  variant = "primary",
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "danger" | "ghost";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}) {
  const styles: Record<string, string> = {
    primary: "bg-[#0B213F] text-[#D4AF37] hover:opacity-90",
    danger:  "bg-rose-500 text-white hover:bg-rose-600",
    ghost:   "border border-slate-200 text-slate-600 hover:bg-slate-50",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

export function TeacherSearch({
  value,
  onChange,
  placeholder = "Cari...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]/50 transition-all shadow-sm"
      />
    </div>
  );
}

export function TeacherCard({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${onClick ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function TeacherEmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-slate-200">
      <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-slate-300">
        {icon}
      </div>
      <p className="text-sm font-bold text-slate-500">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}

export function TeacherStatusBadge({ status }: { status: string }) {
  const s: Record<string, string> = {
    PUBLISHED: "bg-emerald-50 text-emerald-700",
    DRAFT:     "bg-amber-50 text-amber-700",
    ARCHIVED:  "bg-slate-100 text-slate-500",
    ACTIVE:    "bg-blue-50 text-blue-700",
    GRADED:    "bg-emerald-50 text-emerald-700",
    SUBMITTED: "bg-violet-50 text-violet-700",
  };
  const labels: Record<string, string> = {
    PUBLISHED: "Terbit", DRAFT: "Draft", ARCHIVED: "Arsip",
    ACTIVE: "Aktif", GRADED: "Dinilai", SUBMITTED: "Dikumpulkan",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${s[status] ?? "bg-slate-100 text-slate-500"}`}>
      {labels[status] ?? status}
    </span>
  );
}
