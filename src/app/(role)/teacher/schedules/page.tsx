"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, Clock, ExternalLink } from "lucide-react";
import TeacherPageLayout, { TeacherEmptyState } from "@/features/users/components/layouts/TeacherPageLayout";

interface Schedule {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  meetingLink: string | null;
  course: { title: string };
}

const isExpired = (date: string, endTime: string) => {
  const end = new Date(date);
  const [h, m] = endTime.split(":").map(Number);
  end.setHours(h, m, 0, 0);
  return new Date() > end;
};

export default function TeacherSchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading]     = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/dashboard/schedule?all=true", { credentials: "include" });
      if (res.ok) setSchedules((await res.json()).schedules ?? []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const upcoming = schedules.filter(s => !isExpired(s.date, s.endTime));
  const past     = schedules.filter(s => isExpired(s.date, s.endTime));

  return (
    <TeacherPageLayout
      title="Jadwal Mengajar"
      subtitle="Daftar seluruh sesi mengajar Anda berdasarkan tanggal."
    >
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-2xl border border-slate-200 animate-pulse" />)}
        </div>
      ) : schedules.length === 0 ? (
        <TeacherEmptyState icon={<Calendar size={28} />} title="Belum ada jadwal mengajar" subtitle="Jadwal akan ditambahkan oleh admin." />
      ) : (
        <div className="space-y-6">
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Mendatang</p>
              <div className="space-y-3">
                {upcoming.map(s => (
                  <div key={s.id} className="flex items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 px-5 py-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-[#0B213F] flex flex-col items-center justify-center text-white shrink-0">
                        <span className="text-[8px] font-bold uppercase leading-none">
                          {new Date(s.date).toLocaleDateString("id-ID", { month: "short" })}
                        </span>
                        <span className="text-[18px] font-black leading-none">
                          {new Date(s.date).getDate()}
                        </span>
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-800">{s.course.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Clock size={11} className="text-slate-400" />
                          <span className="text-[11px] text-slate-400 font-medium">{s.startTime} – {s.endTime}</span>
                        </div>
                      </div>
                    </div>

                    {s.meetingLink ? (
                      <a href={s.meetingLink} target="_blank" rel="noopener noreferrer"
                        className="shrink-0 flex items-center gap-1.5 bg-[#0B213F] text-[#D4AF37] px-4 py-2 rounded-xl text-[11px] font-bold hover:opacity-90 transition-all">
                        <ExternalLink size={12} /> Masuk Meeting
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-300 font-medium bg-slate-50 px-3 py-1.5 rounded-lg shrink-0">Link belum diatur</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Sudah Selesai</p>
              <div className="space-y-2">
                {past.map(s => (
                  <div key={s.id} className="flex items-center justify-between gap-4 bg-white rounded-2xl border border-slate-100 px-5 py-3.5 opacity-60">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-400 shrink-0">
                        <span className="text-[8px] font-bold uppercase leading-none">
                          {new Date(s.date).toLocaleDateString("id-ID", { month: "short" })}
                        </span>
                        <span className="text-[14px] font-black leading-none">
                          {new Date(s.date).getDate()}
                        </span>
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-slate-600">{s.course.title}</p>
                        <span className="text-[10px] text-slate-400">{s.startTime} – {s.endTime}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold bg-slate-100 text-slate-400 px-3 py-1 rounded-full uppercase tracking-widest shrink-0">Selesai</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </TeacherPageLayout>
  );
}
