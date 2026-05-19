"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen, Award, CalendarDays, Package, ChevronRight,
  ClipboardList, HelpCircle, Users, Sparkles, Clock,
  TrendingUp, ShoppingBag, Play, ArrowRight, Lock,
} from "lucide-react";

/* ─── Types ─────────────────────────────── */
interface StorePackage {
  id: string;
  name: string;
  price: number;
  packageCourses?: { course?: { thumbnailUrl?: string } }[];
}

interface Enrollment {
  id: string;
  course: { id: string; title: string; thumbnailUrl?: string };
}

interface Schedule {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  course?: { title: string };
}

/* ─── Quick Links (hanya aktif saat punya paket) ── */
const QUICK_LINKS = [
  { label: "Kursus Saya",  icon: <BookOpen size={18} />,      href: "/student/enrollments",  color: "bg-blue-50 text-blue-600",      border: "border-blue-100" },
  { label: "Tugas",        icon: <ClipboardList size={18} />, href: "/student/assignments",  color: "bg-violet-50 text-violet-600",  border: "border-violet-100" },
  { label: "Kuis",         icon: <HelpCircle size={18} />,    href: "/student/quizzes",      color: "bg-emerald-50 text-emerald-600", border: "border-emerald-100" },
  { label: "Jadwal",       icon: <CalendarDays size={18} />,  href: "/student/schedules",    color: "bg-amber-50 text-amber-600",    border: "border-amber-100" },
  { label: "Presensi",     icon: <Users size={18} />,         href: "/student/attendance",   color: "bg-rose-50 text-rose-600",      border: "border-rose-100" },
  { label: "Sertifikat",   icon: <Award size={18} />,         href: "/student/certificates", color: "bg-[#D4AF37]/10 text-[#D4AF37]", border: "border-[#D4AF37]/20" },
];

/* ─── Component ──────────────────────────── */
export default function StudentHomeClient() {
  const [user, setUser]                 = useState<{ name: string } | null>(null);
  const [hasActivePackage, setHasActive] = useState(false);
  const [enrollments, setEnrollments]   = useState<Enrollment[]>([]);
  const [schedules, setSchedules]       = useState<Schedule[]>([]);
  const [storePackages, setStore]       = useState<StorePackage[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    Promise.allSettled([
      fetch("/api/auth/me", { credentials: "include" }).then(r => r.json()),
      fetch("/api/student/my-packages", { credentials: "include" }).then(r => r.json()).catch(() => null),
      fetch("/api/student/enrollments", { credentials: "include" }).then(r => r.json()).catch(() => null),
      fetch("/api/student/schedules", { credentials: "include" }).then(r => r.json()).catch(() => null),
      fetch("/api/packages/store", { credentials: "include" }).then(r => r.json()).catch(() => null),
    ]).then(([me, pkg, enroll, sched, store]) => {
      if (me.status === "fulfilled") setUser(me.value?.user ?? null);
      if (pkg.status === "fulfilled") setHasActive(pkg.value?.hasActivePackage ?? false);
      if (enroll.status === "fulfilled") setEnrollments(enroll.value?.enrollments ?? []);
      if (sched.status === "fulfilled") setSchedules(sched.value?.schedules ?? []);
      if (store.status === "fulfilled") setStore(store.value?.packages ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const firstName = user?.name?.split(" ")[0] ?? "Siswa";

  const upcoming = schedules
    .filter(s => new Date(s.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Memuat dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="mx-auto max-w-6xl px-6 md:px-10 py-8 space-y-6">

        {/* ── WELCOME HERO ── */}
        <section className="relative overflow-hidden rounded-2xl bg-[#0B213F] px-8 py-8 md:px-12 md:py-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#D4AF37]/8" />
          <div className="pointer-events-none absolute -right-4 -bottom-12 h-36 w-36 rounded-full bg-white/3" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-[#D4AF37]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
                  Selamat Datang Kembali
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
                Halo, {firstName}! 👋
              </h1>
              <p className="mt-2 text-sm text-white/50 font-medium max-w-md">
                {hasActivePackage
                  ? "Lanjutkan perjalanan belajarmu hari ini."
                  : "Belum punya paket belajar — mulai sekarang!"}
              </p>
            </div>

            <div className="shrink-0">
              {hasActivePackage ? (
                <Link href="/student/enrollments"
                  className="flex items-center gap-2 bg-[#D4AF37] text-[#0B213F] px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest hover:bg-[#c9a430] transition-all shadow-lg">
                  <Play size={13} /> Lanjut Belajar
                </Link>
              ) : (
                <Link href="/student/packages"
                  className="flex items-center gap-2 bg-[#D4AF37] text-[#0B213F] px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest hover:bg-[#c9a430] transition-all shadow-lg">
                  <ShoppingBag size={13} /> Beli Paket
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ── QUICK ACCESS ── */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Akses Cepat</h2>

          {hasActivePackage ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {QUICK_LINKS.map(ql => (
                <Link key={ql.href} href={ql.href}
                  className={`group flex flex-col items-center gap-2 p-3.5 rounded-xl border ${ql.border} bg-slate-50/60 hover:bg-white hover:shadow-md transition-all duration-200`}>
                  <div className={`h-9 w-9 rounded-xl ${ql.color} flex items-center justify-center`}>
                    {ql.icon}
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-900 text-center leading-tight">{ql.label}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-4 rounded-xl bg-slate-50 border border-slate-200 border-dashed px-5 py-4">
              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                <Lock size={16} className="text-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-slate-500">Fitur terkunci</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Beli paket belajar untuk mengakses Kursus, Tugas, Kuis, Jadwal, dan Sertifikat.</p>
              </div>
              <Link href="/student/packages"
                className="shrink-0 flex items-center gap-1.5 text-[11px] font-bold text-[#D4AF37] hover:underline whitespace-nowrap">
                Lihat Paket <ChevronRight size={12} />
              </Link>
            </div>
          )}
        </section>

        {/* ── MAIN GRID (hanya tampil jika punya paket) ── */}
        {hasActivePackage && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Kursus Saya */}
            {enrollments.length > 0 && (
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={13} className="text-[#D4AF37]" /> Kursus Saya
                  </h2>
                  <Link href="/student/enrollments" className="text-[10px] font-bold text-[#D4AF37] hover:underline flex items-center gap-0.5">
                    Semua <ArrowRight size={11} />
                  </Link>
                </div>
                <div className="space-y-2">
                  {enrollments.slice(0, 4).map(e => (
                    <Link key={e.id} href={`/student/courses/${e.course.id}`}
                      className="group flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 hover:bg-white hover:shadow-sm transition-all">
                      {e.course.thumbnailUrl ? (
                        <img src={e.course.thumbnailUrl} alt={e.course.title} className="h-9 w-9 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="h-9 w-9 rounded-lg bg-[#0B213F] flex items-center justify-center text-[#D4AF37] font-black text-sm shrink-0">
                          {e.course.title.charAt(0)}
                        </div>
                      )}
                      <p className="text-[12px] font-bold text-slate-700 truncate flex-1">{e.course.title}</p>
                      <ChevronRight size={13} className="text-slate-300 group-hover:text-slate-500 shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Jadwal Mendatang */}
            {upcoming.length > 0 && (
              <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 ${enrollments.length === 0 ? "lg:col-span-3" : ""}`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Jadwal Mendatang</h2>
                  <Link href="/student/schedules" className="text-[10px] font-bold text-[#D4AF37] hover:underline flex items-center gap-0.5">
                    Semua <ChevronRight size={11} />
                  </Link>
                </div>
                <div className="space-y-2.5">
                  {upcoming.map(s => (
                    <div key={s.id} className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-3">
                      <div className="h-10 w-10 rounded-lg bg-[#0B213F] flex flex-col items-center justify-center text-white shrink-0">
                        <span className="text-[8px] font-bold uppercase leading-none">
                          {new Date(s.date).toLocaleDateString("id-ID", { month: "short" })}
                        </span>
                        <span className="text-[15px] font-black leading-none">
                          {new Date(s.date).getDate()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold text-slate-800 truncate">{s.course?.title ?? "Sesi Belajar"}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock size={10} className="text-slate-400" />
                          <span className="text-[10px] text-slate-400 font-medium">{s.startTime} – {s.endTime}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── STORE PACKAGES (hanya jika belum punya paket & ada paket tersedia) ── */}
        {!hasActivePackage && storePackages.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ShoppingBag size={13} className="text-[#D4AF37]" /> Paket Tersedia
              </h2>
              <Link href="/student/packages" className="text-[10px] font-bold text-[#D4AF37] hover:underline flex items-center gap-1">
                Lihat Semua <ArrowRight size={11} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {storePackages.slice(0, 3).map(pkg => (
                <Link key={pkg.id} href={`/student/packages/${pkg.id}`}
                  className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col">
                  <div className="h-32 bg-[#0B213F] relative overflow-hidden">
                    {pkg.packageCourses?.[0]?.course?.thumbnailUrl ? (
                      <img src={pkg.packageCourses[0].course.thumbnailUrl} alt={pkg.name}
                        className="h-full w-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <Package size={28} className="text-[#D4AF37]/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B213F]/60 to-transparent" />
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <p className="text-[12px] font-bold text-slate-800 line-clamp-1 flex-1 mr-3">{pkg.name}</p>
                    <p className="text-sm font-black text-[#D4AF37] shrink-0">Rp {Number(pkg.price).toLocaleString("id-ID")}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── CTA (hanya jika belum punya paket & tidak ada paket di store) ── */}
        {!hasActivePackage && storePackages.length === 0 && (
          <section className="rounded-2xl bg-[#0B213F] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#D4AF37]/5" />
            <div className="relative">
              <h2 className="text-xl md:text-2xl font-black text-white leading-tight">Mulai Perjalanan Belajarmu!</h2>
              <p className="text-white/50 mt-2 text-sm font-medium">Paket belajar akan segera tersedia.</p>
            </div>
            <Link href="/student/packages"
              className="shrink-0 flex items-center gap-2 bg-[#D4AF37] text-[#0B213F] px-7 py-3.5 rounded-xl font-black text-[12px] uppercase tracking-widest hover:bg-[#c9a430] transition-all shadow-lg">
              <ShoppingBag size={14} /> Cek Katalog
            </Link>
          </section>
        )}

      </div>
    </main>
  );
}
