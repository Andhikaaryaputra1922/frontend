"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, Clock, Link2, ExternalLink, Filter, ChevronRight, User } from "lucide-react";
import { Toast } from "@/shared/components/ui/PremiumFeedback";

interface Schedule {
  id: string;
  courseId: string;
  date: string;
  startTime: string;
  endTime: string;
  meetingLink: string | null;
  course: {
    title: string;
  };
}

export default function TeacherSchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/teacher/dashboard/schedule?all=true", { credentials: "include" });
      if (res.ok) {
        const d = await res.json();
        setSchedules(d.schedules || []);
      }
    } catch (e) {
      console.error(e);
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

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-500">
      
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block h-1.5 w-8 rounded-full bg-[#8B0000]" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#8B0000]">My Academic Calendar</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl uppercase">
            Jadwal <span className="text-[#8B0000]">Mengajar</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500 font-medium">Seluruh daftar sesi mengajar Anda berdasarkan tanggal.</p>
        </header>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 w-full bg-slate-50 animate-pulse rounded-[32px]" />)}
          </div>
        ) : schedules.length === 0 ? (
          <div className="rounded-[40px] border-2 border-dashed border-slate-100 bg-slate-50/50 p-20 text-center">
             <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Calendar size={32} className="text-slate-200" />
             </div>
             <p className="text-lg font-black text-slate-300 uppercase tracking-widest">Belum ada jadwal mengajar</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {schedules.map((s) => {
              const expired = isExpired(s.date, s.endTime);
              return (
                <div key={s.id} className={`group bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-6 ${expired ? "opacity-60 grayscale" : ""}`}>
                   <div className="flex items-center gap-6">
                      <div className={`h-16 w-16 shrink-0 rounded-3xl flex flex-col items-center justify-center transition-all duration-500 ${expired ? "bg-slate-100 text-slate-400" : "bg-[#8B0000]/5 text-[#8B0000] group-hover:bg-[#8B0000] group-hover:text-white"}`}>
                         <Calendar size={20} strokeWidth={3} />
                      </div>
                      <div>
                         <div className="flex items-center gap-3">
                            <h3 className="text-xl font-black text-[#1A2E44] uppercase tracking-tight group-hover:text-[#8B0000] transition-colors">{s.course.title}</h3>
                            {expired && <span className="text-[9px] font-black bg-slate-100 text-slate-400 px-3 py-1 rounded-full uppercase tracking-widest">Selesai</span>}
                         </div>
                         <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                               <Calendar size={14} className="text-[#E5B54F]" /> {new Date(s.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                               <Clock size={14} className="text-[#E5B54F]" /> {s.startTime} - {s.endTime}
                            </span>
                         </div>
                      </div>
                   </div>
                   
                   {s.meetingLink ? (
                     <a 
                       href={expired ? "#" : s.meetingLink}
                       target={expired ? "_self" : "_blank"}
                       rel="noopener noreferrer"
                       className={`flex items-center justify-center gap-3 px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${expired ? "bg-slate-100 text-slate-300 shadow-none cursor-not-allowed" : "bg-[#1A2E44] text-white hover:bg-[#8B0000] shadow-slate-900/10"}`}
                     >
                        {expired ? "Link Kadaluarsa" : "Masuk Meeting"} <ExternalLink size={14} strokeWidth={3} />
                     </a>
                   ) : (
                     <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-6 py-3 rounded-xl">Link Belum Diatur</span>
                   )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
