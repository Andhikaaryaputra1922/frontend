"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PremiumModal, Toast } from "@/shared/components/ui/PremiumFeedback";
import { Clock, ExternalLink } from "lucide-react";

const StatIcon = {
  Students: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Assignment: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  Quiz: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 0 1 4.9.8c0 1.7-2.5 2.5-2.5 2.5"/><circle cx="12" cy="17" r=".5" fill="currentColor"/>
    </svg>
  ),
  Material: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  Grade: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  Attendance: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>
    </svg>
  ),
};

const FeatureIcon = {
  Quiz: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 0 1 4.9.8c0 1.7-2.5 2.5-2.5 2.5"/><circle cx="12" cy="17" r=".5" fill="currentColor"/>
    </svg>
  ),
  Grading: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Material: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  Attendance: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>
    </svg>
  ),

  Announcement: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
};

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await fetch("/api/teacher/dashboard/stats", { credentials: "include" });
      if (statsRes.ok) {
        const d = await statsRes.json();
        if (d) setStats(d.stats);
      }
      fetchActivities();
      fetchSchedule();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await fetch("/api/teacher/dashboard/activities", { credentials: "include" });
      if (res.ok) {
        const d = await res.json();
        setActivities(d.activities || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isExpired = (date: string, endTime: string) => {
    const end = new Date(date);
    const [hours, minutes] = endTime.split(':');
    end.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return new Date() > end;
  };

  const fetchSchedule = async () => {
    try {
      const res = await fetch("/api/teacher/dashboard/schedule", { credentials: "include" });
      if (res.ok) {
        const d = await res.json();
        setSchedules(d.schedules || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Real-time polling every 10 seconds
    const interval = setInterval(fetchActivities, 10000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    { label: "Jumlah Siswa", value: stats?.totalStudents || 0, Icon: StatIcon.Students, accent: "text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400" },
    { label: "Tugas Aktif", value: stats?.activeAssignments || 0, Icon: StatIcon.Assignment, accent: "text-orange-600 bg-orange-50 dark:bg-orange-950/30 dark:text-orange-400" },
    { label: "Quiz Aktif", value: stats?.activeQuizzes || 0, Icon: StatIcon.Quiz, accent: "text-violet-600 bg-violet-50 dark:bg-violet-950/30 dark:text-violet-400" },
    { label: "Total Materi", value: stats?.totalMaterials || 0, Icon: StatIcon.Material, accent: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400" },
    { label: "Perlu Dinilai", value: stats?.pendingSubmissions || 0, Icon: StatIcon.Grade, accent: "text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400" },
    { label: "Tingkat Hadir", value: `${stats?.attendanceRate || 0}%`, Icon: StatIcon.Attendance, accent: "text-teal-600 bg-teal-50 dark:bg-teal-950/30 dark:text-teal-400" },
  ];

  const quickFeatures = [
    { title: "Quiz Builder", desc: "Buat quiz & susun pertanyaan.", href: "/teacher/quizzes", Icon: FeatureIcon.Quiz },
    { title: "Submission", desc: "Nilai & berikan feedback tugas.", href: "/teacher/assignments", Icon: FeatureIcon.Grading },
    { title: "Materi", desc: "Upload modul & video pembelajaran.", href: "/teacher/courses", Icon: FeatureIcon.Material },
    { title: "Absensi", desc: "Catat kehadiran siswa secara live.", href: "/teacher/attendance", Icon: FeatureIcon.Attendance },

    { title: "Pengumuman", desc: "Kirim pesan broadcast ke kelas.", href: "/teacher/announcements", Icon: FeatureIcon.Announcement },
  ];

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#1A2E44]">Real-Time Monitor Active</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl uppercase">
              Dashboard <span className="text-[#8B0000]">Live</span>
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-4 bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm">
             <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Status Server</p>
                <p className="text-[10px] font-black text-green-500 uppercase tracking-widest leading-none">Terhubung</p>
             </div>
             <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
             </div>
          </div>
        </header>

        <div className="space-y-10">
          {/* Stats Grid */}
          <section>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {statCards.map(({ label, value, Icon, accent }) => (
                <div key={label} className="group flex items-center gap-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:border-[#8B0000]/30 hover:shadow-xl hover:shadow-[#1A2E44]/5 transition-all duration-300">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accent} shadow-inner`}>
                    <Icon />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
                    {loading ? (
                      <div className="h-7 w-16 rounded bg-slate-100 animate-pulse" />
                    ) : (
                      <p className="text-2xl font-black text-slate-800 leading-none">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
              <section>
                <div className="flex items-center justify-between mb-6">
                   <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Jadwal Mengajar Hari Ini</p>
                   <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">
                      {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                   </span>
                </div>
                
                {schedules.length === 0 ? (
                  <div className="bg-slate-50/50 rounded-[32px] p-8 border border-dashed border-slate-200 text-center">
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tidak ada jadwal mengajar hari ini.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                     {schedules.map((s: any) => {
                       const expired = isExpired(s.date, s.endTime);
                       return (
                        <div key={s.id} className={`flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm transition-all group ${expired ? "opacity-60 grayscale" : "hover:shadow-lg"}`}>
                           <div className="flex items-center gap-5">
                              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform ${expired ? "bg-slate-100 text-slate-400" : "bg-[#8B0000] text-white shadow-red-900/20 group-hover:scale-110"}`}>
                                 <Clock size={20} strokeWidth={3} />
                              </div>
                              <div>
                                 <div className="flex items-center gap-2">
                                   <h4 className="text-sm font-black text-[#1A2E44] uppercase tracking-tight">{s.course.title}</h4>
                                   {expired && <span className="text-[8px] font-black bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full uppercase">Selesai</span>}
                                 </div>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    {s.startTime} - {s.endTime}
                                 </p>
                              </div>
                           </div>
                           {s.meetingLink ? (
                             <a 
                               href={expired ? "#" : s.meetingLink}
                               target={expired ? "_self" : "_blank"}
                               rel="noopener noreferrer"
                               className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${expired ? "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none" : "bg-[#1A2E44] text-white hover:bg-[#8B0000] shadow-xl shadow-slate-900/10"}`}
                             >
                                {expired ? "Kadaluarsa" : "Masuk Room"} <ExternalLink size={12} strokeWidth={3} />
                             </a>
                           ) : (
                             <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-4 py-2 rounded-lg">Link Belum Diatur</span>
                           )}
                        </div>
                       );
                     })}
                  </div>
                )}
              </section>

              <section>
                <div className="flex items-center justify-between mb-6">
                   <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Navigasi Cepat</p>
                   <Link href="/teacher/courses/new" className="text-[9px] font-black uppercase tracking-widest text-[#8B0000] bg-red-50 px-4 py-2 rounded-xl hover:bg-[#8B0000] hover:text-white transition-all">+ Kursus Baru</Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {quickFeatures.map(({ title, desc, href, Icon }) => (
                    <Link key={href} href={href} className="group relative flex flex-col rounded-[32px] border border-slate-100 bg-white p-6 hover:border-[#8B0000] hover:shadow-xl transition-all duration-500 overflow-hidden">
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-slate-400 group-hover:bg-[#8B0000] group-hover:text-white transition-all duration-300">
                        <Icon />
                      </div>
                      <p className="text-base font-black text-slate-800 group-hover:text-[#1A2E44] mb-1">{title}</p>
                      <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                      <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-[#E5B54F] opacity-0 group-hover:opacity-100 transition-all scale-0 group-hover:scale-100"></div>
                    </Link>
                  ))}
                </div>
              </section>
            </div>

            {/* Activities Sidebar */}
            <div className="space-y-10">
              <section className="rounded-[40px] border border-slate-100 bg-white p-8 shadow-sm h-full flex flex-col">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-[#1A2E44]">Aktivitas Live</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Siswa Real-time</p>
                  </div>
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping"></span>
                </div>
                
                {loading ? (
                  <div className="space-y-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-12 w-full rounded-2xl bg-slate-50 animate-pulse" />)}
                  </div>
                ) : activities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="mb-4 h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Belum Ada Aktivitas</p>
                  </div>
                ) : (
                  <div className="space-y-6 flex-1 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                    {activities.map((act, i) => (
                      <div key={i} className="flex gap-4 group animate-in slide-in-from-right duration-500" style={{ animationDelay: `${i * 50}ms` }}>
                        <div className="relative shrink-0">
                          <div className="h-10 w-10 rounded-full bg-[#1A2E44] border-2 border-[#E5B54F]/20 flex items-center justify-center text-[10px] font-black text-[#E5B54F] shadow-sm overflow-hidden">
                            {act.user.image ? <img src={act.user.image} className="h-full w-full object-cover" /> : act.user.name.charAt(0)}
                          </div>
                          <div className={`absolute -right-1 -bottom-1 h-5 w-5 rounded-full border-2 border-white flex items-center justify-center text-[8px] text-white ${
                            act.type === "ASSIGNMENT" ? "bg-blue-500" :
                            act.type === "ENROLLMENT" ? "bg-green-500" : "bg-amber-500"
                          }`}>
                            {act.type === "ASSIGNMENT" ? "📝" : act.type === "ENROLLMENT" ? "🎓" : "📖"}
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-black text-slate-800 truncate leading-none mb-1">{act.user.name}</p>
                          <p className="text-[9px] text-slate-400 font-medium leading-snug">
                             {act.type === "ASSIGNMENT" ? "Mengumpulkan tugas:" : 
                              act.type === "ENROLLMENT" ? "Mendaftar kursus:" : "Selesaikan materi:"}
                          </p>
                          <p className="text-[10px] font-bold text-[#1A2E44] truncate">{act.target}</p>
                          <div className="flex items-center justify-between mt-2">
                             <p className="text-[8px] text-slate-300 font-black uppercase">{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                             {act.status && (
                               <span className={`text-[8px] font-black px-2 py-0.5 rounded-lg uppercase ${
                                 act.status === "SUBMITTED" ? "bg-blue-50 text-blue-500" :
                                 act.status === "NEW" ? "bg-green-50 text-green-500" : "bg-amber-50 text-amber-500"
                               }`}>
                                 {act.status}
                               </span>
                             )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                

              </section>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>
    </div>
  );
}
