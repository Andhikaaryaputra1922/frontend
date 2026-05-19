/**
 * AdminPageLayout — Shared layout wrapper for all admin pages.
 *
 * Usage:
 *   <AdminPageLayout
 *     title="Manajemen User"
 *     subtitle="Kelola akun siswa, pengajar, dan admin."
 *     action={<button ...>Tambah User</button>}
 *   >
 *     {children}
 *   </AdminPageLayout>
 */

import React from "react";
import Link from "next/link";

interface AdminPageLayoutProps {
  /** Page title shown in the header */
  title: string;
  /** Short description under the title */
  subtitle?: string;
  /** Optional primary action button (top-right) */
  action?: React.ReactNode;
  /** Page content */
  children: React.ReactNode;
  /** Breadcrumb label (defaults to "Admin") */
  breadcrumb?: string;
  /** Breadcrumb href (defaults to "/admin") */
  breadcrumbHref?: string;
}

export default function AdminPageLayout({
  title,
  subtitle,
  action,
  children,
  breadcrumb = "Admin",
  breadcrumbHref = "/admin",
}: AdminPageLayoutProps) {
  return (
    <main className="min-h-screen bg-[#F8FAFC] p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* ── Page Header ── */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {/* Breadcrumb */}
            <Link
              href={breadcrumbHref}
              className="mb-1.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              {breadcrumb}
            </Link>

            {/* Title */}
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>

            {/* Subtitle */}
            {subtitle && (
              <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>
            )}
          </div>

          {/* Action */}
          {action && <div className="shrink-0">{action}</div>}
        </header>

        {/* ── Page Content ── */}
        <div>{children}</div>
      </div>
    </main>
  );
}

/* ── Shared UI Primitives (used inside admin pages) ──────────────────── */

/** White card with border — the standard surface for all admin sections */
export function AdminCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

/** Standard input field */
export function AdminInput({
  label,
  required,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      <input
        required={required}
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:bg-white focus:border-[#0B213F]/30 focus:ring-2 focus:ring-[#0B213F]/10 focus:outline-none transition-all"
        {...props}
      />
    </div>
  );
}

/** Standard select field */
export function AdminSelect({
  label,
  required,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      <select
        required={required}
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-[#0B213F]/30 focus:ring-2 focus:ring-[#0B213F]/10 focus:outline-none transition-all"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

/** Standard textarea field */
export function AdminTextarea({
  label,
  required,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      <textarea
        required={required}
        rows={3}
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:bg-white focus:border-[#0B213F]/30 focus:ring-2 focus:ring-[#0B213F]/10 focus:outline-none transition-all resize-none"
        {...props}
      />
    </div>
  );
}

/** Primary action button (navy) */
export function AdminButton({
  children,
  variant = "primary",
  loading,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
}) {
  const variants = {
    primary: "bg-[#0B213F] text-white hover:bg-[#0B213F]/90",
    secondary: "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50",
    danger: "bg-rose-500 text-white hover:bg-rose-600",
  };
  return (
    <button
      disabled={loading || props.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : null}
      {children}
    </button>
  );
}

/** Small modal container — use inside a backdrop div */
export function AdminModal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[65vh] overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/** Standard table with consistent header/row styling */
export function AdminTable({
  headers,
  children,
  loading,
  empty,
}: {
  headers: string[];
  children: React.ReactNode;
  loading?: boolean;
  empty?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            {headers.map((h) => (
              <th key={h} className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {loading ? (
            <tr>
              <td colSpan={headers.length} className="px-5 py-10 text-center">
                <span className="inline-block h-5 w-5 rounded-full border-2 border-slate-200 border-t-slate-400 animate-spin" />
              </td>
            </tr>
          ) : empty ? (
            <tr>
              <td colSpan={headers.length} className="px-5 py-10 text-center text-sm text-slate-300">
                Tidak ada data
              </td>
            </tr>
          ) : children}
        </tbody>
      </table>
    </div>
  );
}

/** Role badge */
export function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    ADMIN: "bg-rose-50 text-rose-600",
    TEACHER: "bg-amber-50 text-amber-700",
    STUDENT: "bg-emerald-50 text-emerald-700",
    PARENT: "bg-blue-50 text-blue-700",
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${styles[role] ?? "bg-slate-100 text-slate-500"}`}>
      {role}
    </span>
  );
}

/** Status badge — active / inactive */
export function StatusBadge({ active, activeLabel = "Aktif", inactiveLabel = "Nonaktif" }: { active: boolean; activeLabel?: string; inactiveLabel?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-300"}`} />
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

/** Search bar */
export function AdminSearch({ value, onChange, placeholder = "Cari..." }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-700 placeholder-slate-300 focus:bg-white focus:border-[#0B213F]/30 focus:ring-2 focus:ring-[#0B213F]/10 focus:outline-none transition-all"
      />
    </div>
  );
}
