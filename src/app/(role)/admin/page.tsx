"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Users, ShieldCheck, BookOpen, CreditCard,
  TrendingUp, ArrowRight, CheckCircle2, Package, CalendarDays, ClipboardList, Award,
} from "lucide-react";

// ── Animated number counter ───────────────────────────────────────────────────
function Counter({ value }: { value: number | string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (typeof value !== "number") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 900;
        const start = performance.now();
        const animate = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - t, 3);
          setDisplay(Math.round(ease * (value as number)));
          if (t < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  if (typeof value !== "number") return <span ref={ref}>{value}</span>;
  return <span ref={ref}>{display}</span>;
}

interface Stats {
  totalStudents: number; totalTeachers: number;
  totalCourses: number; pendingTransactions: number;
  error?: string;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const origin = window.location.origin;
        const [sRes, tRes, cRes, txRes] = await Promise.all([
          fetch(`${origin}/api/admin/users?role=STUDENT`, { credentials: "include", cache: "no-store" }),
          fetch(`${origin}/api/admin/users?role=TEACHER`, { credentials: "include", cache: "no-store" }),
          fetch(`${origin}/api/courses`, { credentials: "include", cache: "no-store" }),
          fetch(`${origin}/api/admin/transactions`, { credentials: "include", cache: "no-store" }),
        ]);
        
        if (!sRes.ok) console.error("STUDENT fetch error:", sRes.status, await sRes.text());
        if (!tRes.ok) console.error("TEACHER fetch error:", tRes.status, await tRes.text());
        if (!cRes.ok) console.error("COURSES fetch error:", cRes.status, await cRes.text());
        if (!txRes.ok) console.error("TX fetch error:", txRes.status, await txRes.text());

        const s = await (sRes.ok ? sRes.json() : Promise.resolve({ users: [] }));
        const t = await (tRes.ok ? tRes.json() : Promise.resolve({ users: [] }));
        const c = await (cRes.ok ? cRes.json() : Promise.resolve({ courses: [] }));
        const tx = await (txRes.ok ? txRes.json() : Promise.resolve({ transactions: [] }));
        const txList = tx.transactions ?? [];
        setStats({
          totalStudents: (s.users ?? []).length,
          totalTeachers: (t.users ?? []).length,
          totalCourses: (c.courses ?? []).length,
          pendingTransactions: txList.filter((x: any) => x.status === "PENDING").length,
          error: (!sRes.ok || !tRes.ok || !cRes.ok || !txRes.ok) 
            ? `API Error: S(${sRes.status}) T(${tRes.status}) C(${cRes.status}) TX(${txRes.status})` 
            : undefined
        });
      } catch (e: any) { 
        console.error(e); 
        setStats({ totalStudents: 0, totalTeachers: 0, totalCourses: 0, pendingTransactions: 0, error: e.message });
      }
    };
    load();
  }, []);

  const statCards = [
    { label: "Siswa Aktif",     value: stats?.totalStudents       ?? "Memuat...", icon: <Users size={18} />,        color: "bg-blue-50 text-blue-600" },
    { label: "Pengajar",        value: stats?.totalTeachers       ?? "Memuat...", icon: <ShieldCheck size={18} />,  color: "bg-violet-50 text-violet-600" },
    { label: "Mata Pelajaran",  value: stats?.totalCourses        ?? "Memuat...", icon: <BookOpen size={18} />,     color: "bg-amber-50 text-amber-600" },
    { label: "Transaksi Pending", value: stats?.pendingTransactions ?? "Memuat...", icon: <CreditCard size={18} />, color: "bg-rose-50 text-rose-600" },
  ];

  const quickLinks = [
    { href: "/admin/packages",     label: "Paket Belajar",  desc: "Kelola paket dan assign siswa",          icon: <Package size={16} /> },
    { href: "/admin/users",        label: "Manajemen User", desc: "CRUD akun siswa, guru, dan admin",       icon: <Users size={16} /> },
    { href: "/admin/courses",      label: "Moderasi Mapel", desc: "Terbitkan atau tarik mata pelajaran",    icon: <BookOpen size={16} /> },
    { href: "/admin/transactions", label: "Transaksi",      desc: "Approve dan monitor pembayaran",         icon: <CreditCard size={16} /> },
    { href: "/admin/schedules",    label: "Jadwal",         desc: "Atur jadwal sesi per mata pelajaran",    icon: <CalendarDays size={16} /> },
    { href: "/admin/batches",      label: "Angkatan",       desc: "Kelola angkatan dan kuota siswa",        icon: <ClipboardList size={16} /> },
    { href: "/admin/attendance",   label: "Presensi",       desc: "Pantau kehadiran siswa per sesi",        icon: <CheckCircle2 size={16} /> },
    { href: "/admin/certificates", label: "Sertifikat",     desc: "Terbitkan dan kelola sertifikat",        icon: <Award size={16} /> },
  ];

  const systemStatus = [
    "Attendance & gradebook",
    "Payment monitoring",
    "Backup & audit log",
    "Certificate engine",
  ];

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* ── Header ── */}
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Admin Panel</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="mt-0.5 text-sm text-slate-400">Pusat kendali operasional Haneen Academy.</p>
        </header>

        {/* ── Stat Cards ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map(s => (
            <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:-translate-y-0.5 transition-transform">
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}>
                  {s.icon}
                </div>
                <TrendingUp size={12} className="text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {typeof s.value === "number" ? <Counter value={s.value} /> : <span className="text-sm font-medium text-slate-400">{s.value}</span>}
              </p>
              <p className="text-[12px] text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        {stats?.error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-semibold border border-red-100">
            Error fetching data: {stats.error}
          </div>
        )}

        {/* ── Quick Links ── */}
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-4">Menu Cepat</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map(item => (
              <Link key={item.href} href={item.href}
                className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:border-[#0B213F]/20 hover:shadow-md transition-all">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-[#0B213F] group-hover:text-white transition-all">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-slate-800 group-hover:text-[#0B213F] transition-colors">{item.label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{item.desc}</p>
                </div>
                <ArrowRight size={13} className="shrink-0 mt-0.5 text-slate-300 group-hover:text-[#0B213F] group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        </section>

        {/* ── System Status ── */}
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-4">Status Sistem</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {systemStatus.map((s, i) => (
              <div key={s} className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0"
                  style={{ animation: `pulse 2s ease-in-out ${i * 400}ms infinite` }} />
                <span className="text-[12px] text-slate-500 font-medium">{s}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
