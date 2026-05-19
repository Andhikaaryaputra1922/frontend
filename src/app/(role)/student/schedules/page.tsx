"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, Clock, Link2, Search, User, ExternalLink, BookOpen } from "lucide-react";
import { Toast } from "@/shared/components/ui/PremiumFeedback";
import BackButton from "@/shared/components/ui/BackButton";
import Link from "next/link";

interface Schedule {
  id: string;
  courseId: string;
  topic?: string;
  date: string;
  startTime: string;
  endTime: string;
  meetingLink: string | null;
  course: {
    title: string;
    teachers: { id: string, name: string }[];
  };
  batch?: { name: string } | null;
}

export default function StudentSchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/student/schedules", { credentials: "include" });
      if (res.ok) {
        const d = await res.json();
        setSchedules(d.schedules || []);
      } else {
        setToast({ message: "Gagal mengambil jadwal", type: "error" });
      }
    } catch (e) {
      setToast({ message: "Terjadi kesalahan koneksi", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isExpired = (date: string, endTime: string) => {
    const end = new Date(date);
    const [hours, minutes] = endTime.split(':');
    end.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return new Date() > end;
  };

  const filteredSchedules = schedules.filter(s => 
    s.course.title.toLowerCase().includes(search.toLowerCase()) ||
    (s.topic?.toLowerCase().includes(search.toLowerCase())) ||
    s.course.teachers.some(t => t.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="px-6 py-10 animate-in fade-in duration-500">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block h-1.5 w-8 rounded-full bg-[#D4AF37]" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#D4AF37]">My Learning Plan</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl uppercase">
              Jadwal <span className="text-[#0B213F]">Belajar</span>
            </h1>
            <p className="mt-2 text-sm font-bold text-slate-400 uppercase tracking-widest">Pantau sesi live dan materi kelas kamu di sini.</p>
          </div>
          <div className="flex items-center gap-3">
            <BackButton />
            <Link
              href="/student"
              className="inline-flex rounded-full border border-slate-200 bg-white px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              Dashboard
            </Link>
          </div>
        </header>

        {/* Search */}
        <div className="mb-8">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0B213F] transition-colors" size={20} />
            <input
              type="text"
              placeholder="Cari mata pelajaran atau topik..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-5 rounded-[28px] border border-slate-100 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-[#0B213F]/5 transition-all font-bold text-sm"
            />
          </div>
        </div>

        {/* Schedule List */}
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 w-full bg-slate-50 animate-pulse rounded-[40px]" />)}
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="rounded-[40px] border-2 border-dashed border-slate-100 bg-slate-50/50 p-20 text-center">
            <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Calendar size={32} className="text-slate-200" />
            </div>
            <p className="text-lg font-black text-slate-300 uppercase tracking-widest">Belum ada jadwal kelas</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredSchedules.map((s) => {
              const expired = isExpired(s.date, s.endTime);
              return (
                <div key={s.id} className={`group relative bg-white p-8 rounded-[44px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden ${expired ? "opacity-60 grayscale" : "hover:border-[#0B213F]/10"}`}>
                  
                  {/* Decorative Gradient Background */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-slate-50 to-transparent -mr-32 -mt-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-start md:items-center gap-6">
                      <div className={`h-20 w-20 shrink-0 rounded-[28px] flex flex-col items-center justify-center transition-all duration-500 ${expired ? "bg-slate-100 text-slate-400" : "bg-[#0B213F]/5 text-[#0B213F] group-hover:bg-[#0B213F] group-hover:text-white"}`}>
                        <Calendar size={24} strokeWidth={3} />
                      </div>
                      
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-black text-[#0B213F] uppercase tracking-tight leading-none group-hover:text-[#D4AF37] transition-colors">{s.course.title}</h3>
                          {s.batch && (
                            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest">
                              {s.batch.name}
                            </span>
                          )}
                          {expired && <span className="text-[9px] font-black bg-slate-100 text-slate-400 px-3 py-1 rounded-full uppercase tracking-widest">Selesai</span>}
                        </div>

                        {s.topic && (
                          <p className="mt-1 text-sm font-bold text-slate-600 line-clamp-1">{s.topic}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-y-2 gap-x-5 mt-4">
                          <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                            <User size={14} className="text-[#D4AF37]" /> 
                            {s.course.teachers.map(t => t.name).join(", ") || "Guru Pengampu"}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                            <Calendar size={14} className="text-[#D4AF37]" /> 
                            {new Date(s.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                            <Clock size={14} className="text-[#D4AF37]" /> 
                            {s.startTime} - {s.endTime}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-3">
                      {s.meetingLink ? (
                        <a
                          href={expired ? "#" : s.meetingLink}
                          target={expired ? "_self" : "_blank"}
                          rel="noopener noreferrer"
                          className={`flex items-center gap-3 px-8 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                            expired 
                              ? "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none" 
                              : "bg-[#0B213F] text-white hover:bg-[#8B0000] shadow-[#0B213F]/10 hover:shadow-[#8B0000]/20"
                          }`}
                        >
                          <Link2 size={18} strokeWidth={3} /> {expired ? "Sesi Berakhir" : "Masuk Kelas"}
                        </a>
                      ) : (
                        <div className="px-6 py-4 rounded-[24px] bg-slate-50 border border-slate-100 text-slate-300 text-[10px] font-black uppercase tracking-widest">
                          Link Belum Tersedia
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx global>{`
        .grayscale { filter: grayscale(1); }
      `}</style>
    </div>
  );
}
