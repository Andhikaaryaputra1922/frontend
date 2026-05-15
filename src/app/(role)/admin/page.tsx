"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

/* ── SVG Icons (Dashboard) ───────────────── */
const IC = {
  Users: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Packages: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  Courses: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  CreditCard: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  TrendUp: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Arrow: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  Activity: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  Shield: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
};

/* ── Animated Counter ─────────────────────── */
function AnimatedCounter({ value }: { value: number | string }) {
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typeof value !== "number") return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, started]);

  useEffect(() => {
    if (!started || typeof value !== "number") return;
    const duration = 1200;
    const start = performance.now();
    const frame = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setDisplay(Math.round(ease * value));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [started, value]);

  if (typeof value !== "number") return <span ref={ref}>{value}</span>;
  return <span ref={ref}>{display}</span>;
}

interface Stats {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalTransactions: number;
  pendingTransactions: number;
}

/* ── Styles injected once ─────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');

  .admin-root * { font-family: 'DM Sans', sans-serif; }
  .admin-root h1 { font-family: 'Syne', sans-serif; }
  .admin-root h2.section-label { font-family: 'DM Sans', sans-serif; }

  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(139,0,0,0.3); }
    50%       { box-shadow: 0 0 0 8px rgba(139,0,0,0); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes dotPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.5; transform: scale(0.75); }
  }
  @keyframes borderRun {
    0%   { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
  }

  .fade-slide-up {
    animation: fadeSlideUp 0.55s cubic-bezier(0.16,1,0.3,1) both;
  }
  .fade-in { animation: fadeIn 0.4s ease both; }

  /* Stat card tilt effect */
  .stat-card {
    transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease;
    cursor: default;
    will-change: transform;
  }
  .stat-card:hover { transform: translateY(-4px) scale(1.025); }
  .stat-card.primary:hover { box-shadow: 0 20px 40px rgba(139,0,0,0.25); }
  .stat-card.bordered:hover { box-shadow: 0 20px 40px rgba(0,0,0,0.10); }
  .stat-card.amber:hover { box-shadow: 0 20px 40px rgba(245,158,11,0.3); }

  /* Menu card */
  .menu-card {
    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease, border-color 0.2s;
    position: relative;
    overflow: hidden;
  }
  .menu-card::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.3s;
    background: radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.06) 0%, transparent 70%);
    pointer-events: none;
    z-index: 1;
  }
  .menu-card:hover::before { opacity: 1; }
  .menu-card:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(0,0,0,0.10); }

  /* Accent bar animate */
  .accent-bar {
    transition: width 0.25s ease;
  }
  .menu-card:hover .accent-bar { width: 6px !important; }

  /* Arrow button */
  .arrow-btn {
    transition: background 0.2s, color 0.2s, transform 0.2s;
  }
  .menu-card:hover .arrow-btn {
    background: #0f172a;
    color: white;
    transform: translateX(3px);
  }

  /* Status dot */
  .status-dot { animation: dotPulse 2s ease-in-out infinite; }

  /* Status card */
  .status-card {
    transition: border-color 0.2s, background 0.2s, transform 0.2s;
  }
  .status-card:hover {
    border-color: #d1fae5;
    background: #f0fdf4;
    transform: translateY(-1px);
  }

  /* Icon glow on stat card hover */
  .stat-card.primary:hover .icon-wrap { animation: pulseGlow 1.5s infinite; }

  /* Noise texture overlay */
  .noise-overlay {
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    border-radius: inherit;
    mix-blend-mode: overlay;
  }
`;

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const fetchStats = async () => {
      try {
        const [studentsRes, teachersRes, coursesRes, transactionsRes] = await Promise.all([
          fetch("/api/admin/users?role=STUDENT", { credentials: "include" }),
          fetch("/api/admin/users?role=TEACHER", { credentials: "include" }),
          fetch("/api/courses", { credentials: "include" }),
          fetch("/api/admin/transactions", { credentials: "include" }),
        ]);
        const students = await (studentsRes.ok ? studentsRes.json() : Promise.resolve({ users: [] }));
        const teachers = await (teachersRes.ok ? teachersRes.json() : Promise.resolve({ users: [] }));
        const courses = await (coursesRes.ok ? coursesRes.json() : Promise.resolve({ courses: [] }));
        const transactions = await (transactionsRes.ok ? transactionsRes.json() : Promise.resolve({ transactions: [] }));
        const txList = transactions.transactions ?? [];
        setStats({
          totalStudents: (students.users ?? []).length,
          totalTeachers: (teachers.users ?? []).length,
          totalCourses: (courses.courses ?? []).length,
          totalTransactions: txList.length,
          pendingTransactions: txList.filter((t: any) => t.status === "PENDING").length,
        });
      } catch (err) {
        console.error("Dashboard stats load error:", err);
      }
    };
    fetchStats();
  }, []);

  /* Mouse-tilt for menu cards */
  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--mx", `${x}%`);
    el.style.setProperty("--my", `${y}%`);
  };

  const statCards = [
    {
      label: "Siswa Aktif",
      value: stats?.totalStudents ?? "–",
      icon: <IC.Users />,
      variant: "primary",
      bg: "bg-[#8B0000]",
      text: "text-white",
      iconBg: "bg-white/15",
      delay: "0ms",
    },
    {
      label: "Pengajar",
      value: stats?.totalTeachers ?? "–",
      icon: <IC.Shield />,
      variant: "bordered",
      bg: "bg-white",
      text: "text-[#8B0000]",
      iconBg: "bg-[#8B0000]/10",
      border: true,
      delay: "80ms",
    },
    {
      label: "Total Course",
      value: stats?.totalCourses ?? "–",
      icon: <IC.Courses />,
      variant: "bordered",
      bg: "bg-white",
      text: "text-slate-800",
      iconBg: "bg-amber-100",
      border: true,
      delay: "160ms",
    },
    {
      label: "Pending Review",
      value: stats?.pendingTransactions ?? "–",
      icon: <IC.Activity />,
      variant: "amber",
      bg: "bg-amber-500",
      text: "text-white",
      iconBg: "bg-white/20",
      delay: "240ms",
    },
  ];

  const menuItems = [
    { href: "/admin/packages", title: "Manajemen Paket", desc: "Kelola paket belajar, assign siswa, dan mapping course", icon: <IC.Packages />, accent: "#8B0000", delay: "0ms" },
    { href: "/admin/users", title: "Manajemen User", desc: "CRUD user, kontrol role (Admin/Teacher/Student)", icon: <IC.Users />, accent: "#1E40AF", delay: "60ms" },
    { href: "/admin/courses", title: "Moderasi Course", desc: "Review, publish, dan arsipkan course dari teacher", icon: <IC.Courses />, accent: "#D97706", delay: "120ms" },
    { href: "/admin/transactions", title: "Transaksi & Pembayaran", desc: "Monitoring pembayaran dan status transaksi manual", icon: <IC.CreditCard />, accent: "#059669", delay: "180ms" },
  ];

  const systemStatus = [
    "Attendance & gradebook operations",
    "Payment & transaction monitoring",
    "Audit log + backup orchestration",
    "AI tools management (quiz generator)",
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="admin-root p-6 md:p-10 min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto">

            {/* ── Header ── */}
          <header className="mb-10 fade-slide-up" style={{animationDelay:"0ms"}}>
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#1A2E44] mb-2">Dashboard</p>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
              Selamat Datang, <span className="text-[#1A2E44]">Admin</span>
            </h1>
            <p className="mt-2 text-sm text-slate-500">Kontrol pusat untuk operasional LMS Haneen Academy.</p>
          </header>
          
          {/* Stat Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-10">
            {statCards.map((s) => (
              <div
                key={s.label}
                className={`stat-card ${s.variant} relative rounded-2xl p-5 ${s.bg} ${s.border ? "border border-slate-200 shadow-sm" : "shadow-md"} fade-slide-up`}
                style={{ animationDelay: mounted ? s.delay : "0ms" }}
              >
                <div className="noise-overlay" />
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`icon-wrap flex h-10 w-10 items-center justify-center rounded-xl ${s.iconBg}`}
                    style={{ transition: "box-shadow 0.3s" }}
                  >
                    <span className={s.text}>{s.icon}</span>
                  </div>
                  <span
                    className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
                      s.bg === "bg-white" ? "text-emerald-600" : "text-white/70"
                    }`}
                  >
                    <IC.TrendUp /> Live
                  </span>
                </div>
                <p className={`text-3xl font-black ${s.text}`}>
                  <AnimatedCounter value={s.value} />
                </p>
                <p
                  className={`text-xs font-semibold mt-1 ${
                    s.bg === "bg-white" ? "text-slate-500" : "text-white/60"
                  }`}
                >
                  {s.label}
                </p>
                {/* Bottom shine line */}
                <div
                  className="absolute bottom-0 left-4 right-4 h-px rounded-full opacity-20"
                  style={{
                    background:
                      s.bg === "bg-white"
                        ? "linear-gradient(90deg, transparent, #64748b, transparent)"
                        : "linear-gradient(90deg, transparent, white, transparent)",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Quick Menu */}
          <div className="mb-4 fade-slide-up" style={{ animationDelay: "300ms" }}>
            <h2 className="section-label text-xs font-black uppercase tracking-[0.15em] text-slate-400 mb-4">
              Menu Cepat
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onMouseMove={handleMouseMove}
                className={`menu-card group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm fade-slide-up`}
                style={{ animationDelay: `${320 + parseInt(item.delay)}ms` }}
              >
                {/* Accent bar */}
                <div
                  className="accent-bar absolute top-0 left-0 h-full w-1 rounded-l-2xl"
                  style={{ backgroundColor: item.accent }}
                />
                {/* Light shimmer on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at top left, ${item.accent}08 0%, transparent 60%)`,
                  }}
                />
                <div className="relative z-10 flex items-start gap-4 pl-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
                    style={{ backgroundColor: item.accent + "18", color: item.accent }}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-black text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="arrow-btn flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                    <IC.Arrow />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* System Status */}
          <div
            className="mt-10 fade-slide-up"
            style={{ animationDelay: "520ms" }}
          >
            <h2 className="section-label text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-4">
              Status Sistem
            </h2>
            <div className="grid gap-3 md:grid-cols-4">
              {systemStatus.map((section, i) => (
                <div
                  key={section}
                  className="status-card flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-500 fade-slide-up"
                  style={{ animationDelay: `${540 + i * 50}ms` }}
                >
                  <span
                    className="status-dot h-2 w-2 rounded-full bg-emerald-400 shrink-0"
                    style={{ animationDelay: `${i * 400}ms` }}
                  />
                  {section}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
