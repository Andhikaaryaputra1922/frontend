"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users, FileText, HelpCircle, BookOpen, Activity, UserCheck,
  Calendar, Clock, ExternalLink, ArrowRight, ClipboardList, Play,
} from "lucide-react";

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);

  const fetchActivities = async () => {
    try {
      const res = await fetch("/api/teacher/dashboard/activities", { credentials: "include" });
      if (res.ok) setActivities((await res.json()).activities || []);
    } catch {}
  };

  useEffect(() => {
    const load = async () => {
      try {
        const statsRes = await fetch("/api/teacher/dashboard/stats", { credentials: "include" });
        if (statsRes.ok) setStats((await statsRes.json()).stats);

        const schRes = await fetch("/api/teacher/dashboard/schedule", { credentials: "include" });
        if (schRes.ok) setSchedules((await schRes.json()).schedules || []);

        await fetchActivities();
      } catch {}
      finally { setLoading(false); }
    };
    load();
    const poll = setInterval(fetchActivities, 10000);
    return () => clearInterval(poll);
  }, []);

  const isExpired = (date: string, endTime: string) => {
    const end = new Date(date);
    const [h, m] = endTime.split(":").map(Number);
    end.setHours(h, m);
    return new Date() > end;
  };

  const statCards = [
    { label: "Jumlah Siswa",  value: stats?.totalStudents       || 0, icon: <Users size={16} />,      color: "bg-blue-50 text-blue-600" },
    { label: "Tugas Aktif",   value: stats?.activeAssignments   || 0, icon: <FileText size={16} />,   color: "bg-orange-50 text-orange-600" },
    { label: "Quiz Aktif",    value: stats?.activeQuizzes       || 0, icon: <HelpCircle size={16} />, color: "bg-violet-50 text-violet-600" },
    { label: "Total Materi",  value: stats?.totalMaterials      || 0, icon: <BookOpen size={16} />,   color: "bg-emerald-50 text-emerald-600" },
    { label: "Perlu Dinilai", value: stats?.pendingSubmissions  || 0, icon: <Activity size={16} />,   color: "bg-rose-50 text-rose-600" },
    { label: "Tingkat Hadir", value: `${stats?.attendanceRate  || 0}%`, icon: <UserCheck size={16} />, color: "bg-teal-50 text-teal-600" },
  ];

  const quickLinks = [
    { title: "Quiz Builder",  desc: "Buat quiz & soal.",          href: "/teacher/quizzes",     icon: <HelpCircle size={15} /> },
    { title: "Submission",    desc: "Nilai tugas siswa.",          href: "/teacher/assignments", icon: <ClipboardList size={15} /> },
    { title: "Materi",        desc: "Upload modul & video.",       href: "/teacher/courses",     icon: <Play size={15} /> },
    { title: "Absensi",       desc: "Catat kehadiran live.",       href: "/teacher/attendance",  icon: <UserCheck size={15} /> },
  ];



  return (
    <main className="min-h-screen bg-[#F8FAFC] p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* ── Header ── */}
        <header>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Pengajar</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
            <p className="mt-0.5 text-sm text-slate-400">
              {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </header>

        {/* ── Stat Cards ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map(s => (
            <div key={s.label} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:-translate-y-0.5 transition-transform">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${s.color}`}>
                {s.icon}
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{s.label}</p>
                {loading ? (
                  <div className="mt-1 h-6 w-12 rounded bg-slate-100 animate-pulse" />
                ) : (
                  <p className="text-xl font-bold text-slate-900 leading-none mt-1">{s.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Main 2-col layout ── */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Left col: Schedule + Quick Links */}
          <div className="lg:col-span-2 space-y-6">

            {/* Today's Schedule */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  Jadwal Mengajar Hari Ini
                </h2>
                <Link href="/teacher/schedules" className="flex items-center gap-1 text-[11px] font-semibold text-[#0B213F] hover:underline">
                  Lihat semua <ArrowRight size={11} />
                </Link>
              </div>

              {schedules.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
                  <Calendar size={24} className="mx-auto mb-2 text-slate-200" />
                  <p className="text-[12px] text-slate-300 font-medium">Tidak ada jadwal mengajar hari ini</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {schedules.map((s: any) => {
                    const expired = isExpired(s.date, s.endTime);
                    return (
                      <div key={s.id}
                        className={`flex items-center justify-between gap-4 rounded-xl border bg-white p-4 transition-all ${expired ? "border-slate-100 opacity-60" : "border-slate-200 hover:shadow-sm"}`}>
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${expired ? "bg-slate-100 text-slate-400" : "bg-[#0B213F] text-white"}`}>
                            <Clock size={15} />
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-slate-800">{s.course.title}</p>
                            <p className="text-[11px] text-slate-400">{s.startTime} — {s.endTime}</p>
                          </div>
                        </div>
                        {s.meetingLink && (
                          <a href={expired ? undefined : s.meetingLink} target="_blank" rel="noopener noreferrer"
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all ${expired ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-[#0B213F] text-white hover:bg-[#0B213F]/90"}`}>
                            {expired ? "Selesai" : "Masuk Room"} <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Quick Links */}
            <section>
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-4">Navigasi Cepat</h2>
              <div className="grid grid-cols-2 gap-3">
                {quickLinks.map(item => (
                  <Link key={item.href} href={item.href}
                    className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:border-[#0B213F]/20 hover:shadow-sm transition-all">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-[#0B213F] group-hover:text-white transition-all">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-slate-800">{item.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Right col: Tugas Masuk */}
          <div>
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm h-full">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <p className="text-[12px] font-semibold text-slate-800">Tugas Masuk</p>
                  <p className="text-[10px] text-slate-400">Submission yang perlu dinilai</p>
                </div>
                <Link href="/teacher/assignments" className="text-[10px] font-semibold text-[#0B213F] hover:underline">
                  Lihat semua
                </Link>
              </div>

              <div className="px-5 py-4 space-y-3 max-h-[440px] overflow-y-auto">
                {loading ? (
                  [1, 2, 3, 4].map(i => <div key={i} className="h-14 w-full rounded-lg bg-slate-100 animate-pulse" />)
                ) : activities.filter(a => a.type === "ASSIGNMENT").length === 0 ? (
                  <div className="flex flex-col items-center py-10">
                    <ClipboardList size={24} className="text-slate-200 mb-2" />
                    <p className="text-[12px] text-slate-300 font-medium">Belum ada tugas masuk</p>
                    <p className="text-[10px] text-slate-300 mt-0.5">Semua tugas sudah dinilai</p>
                  </div>
                ) : (
                  activities.filter(a => a.type === "ASSIGNMENT").map((act, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition group">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500 overflow-hidden">
                        {act.user.image ? <img src={act.user.image} className="h-full w-full object-cover" alt="" /> : <FileText size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-slate-800 truncate">{act.user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">Mengumpulkan: {act.target}</p>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <p className="text-[10px] text-slate-300">
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <span className="mt-0.5 px-2 py-0.5 rounded-md bg-orange-50 text-orange-500 text-[9px] font-bold">
                          Perlu Dinilai
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
