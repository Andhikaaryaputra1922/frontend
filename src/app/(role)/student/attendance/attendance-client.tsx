"use client";

import { useState } from "react";
import { 
  Calendar, Clock, CheckCircle2, XCircle, 
  MapPin, PlayCircle, History, Info, ChevronRight
} from "lucide-react";
import { Toast } from "@/shared/components/ui/PremiumFeedback";

type Session = {
  id: string;
  topic: string | null;
  date: string;
  startTime: string;
  endTime: string;
  isAttendanceOpen: boolean;
  course: { title: string };
  attendances: any[];
};

type HistoryItem = {
  id: string;
  status: string;
  checkedAt: string;
  course: { title: string };
  schedule: { date: string; topic: string | null } | null;
};

type Props = {
  initialSessions: Session[];
  initialHistory: HistoryItem[];
};

export default function StudentAttendanceClient({ initialSessions, initialHistory }: Props) {
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [history, setHistory] = useState<HistoryItem[]>(initialHistory);
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCheckIn = async (scheduleId: string) => {
    setLoading(scheduleId);
    try {
      // Get location if possible
      let coords = { latitude: null, longitude: null };
      if ("geolocation" in navigator) {
        const pos: any = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), { timeout: 5000 });
        });
        if (pos) {
          coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        }
      }

      const res = await fetch("/api/student/attendance/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduleId, ...coords })
      });

      if (res.ok) {
        const data = await res.json();
        showToast("Check-in Berhasil! Semangat belajarnya.");
        // Update local state
        setSessions(prev => prev.map(s => s.id === scheduleId ? { ...s, attendances: [data.attendance] } : s));
        // Refresh history
        const hRes = await fetch("/api/student/attendance/history");
        if (hRes.ok) {
          const hData = await hRes.json();
          setHistory(hData.history);
        }
      } else {
        const err = await res.json();
        showToast(err.message || "Gagal check-in", "error");
      }
    } catch (e) {
      showToast("Terjadi kesalahan sistem", "error");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-12">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* TODAY'S ACTIVE SESSIONS */}
      <section>
        <div className="flex items-center gap-3 mb-6">
           <PlayCircle className="text-[#8B0000]" size={20} />
           <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Kelas Hari Ini</h2>
        </div>

        {sessions.length === 0 ? (
          <div className="p-12 bg-white rounded-[40px] border border-slate-100 text-center">
             <Info className="mx-auto text-slate-200 mb-4" size={40} />
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Tidak ada jadwal kelas untuk hari ini</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sessions.map((s) => {
              const hasCheckedIn = s.attendances.length > 0;
              return (
                <div key={s.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                       <span className="px-4 py-1.5 rounded-full bg-slate-50 text-[#8B0000] text-[9px] font-black uppercase tracking-widest border border-slate-100">Live Class</span>
                       {hasCheckedIn ? (
                         <span className="flex items-center gap-2 text-emerald-500 font-black uppercase tracking-widest text-[9px]">
                            <CheckCircle2 size={14}/> Sudah Absen
                         </span>
                       ) : s.isAttendanceOpen ? (
                         <span className="flex items-center gap-2 text-amber-500 font-black uppercase tracking-widest text-[9px] animate-pulse">
                            <PlayCircle size={14}/> Absensi Dibuka
                         </span>
                       ) : (
                         <span className="text-slate-300 font-black uppercase tracking-widest text-[9px]">Absensi Belum Dibuka</span>
                       )}
                    </div>
                    <h3 className="text-2xl font-black text-[#0B213F] uppercase tracking-tight mb-1">{s.topic || "Materi Live Class"}</h3>
                    <p className="text-sm text-slate-400 font-medium">{s.course.title}</p>
                    <div className="mt-6 flex items-center gap-6">
                       <div className="flex items-center gap-2 text-slate-500">
                          <Calendar size={14} className="text-[#D4AF37]"/>
                          <span className="text-xs font-bold">{new Date(s.date).toLocaleDateString('id-ID', { day:'numeric', month:'long' })}</span>
                       </div>
                       <div className="flex items-center gap-2 text-slate-500">
                          <Clock size={14} className="text-[#D4AF37]"/>
                          <span className="text-xs font-bold">{s.startTime} - {s.endTime}</span>
                       </div>
                    </div>
                  </div>

                  <div className="mt-10">
                    {!hasCheckedIn ? (
                      <button 
                        onClick={() => handleCheckIn(s.id)}
                        disabled={!s.isAttendanceOpen || loading === s.id}
                        className={`w-full py-5 rounded-[24px] font-black uppercase tracking-widest text-[11px] shadow-xl transition-all active:scale-95 ${
                          s.isAttendanceOpen 
                          ? "bg-[#0B213F] text-white hover:bg-[#8B0000] shadow-slate-900/10" 
                          : "bg-slate-100 text-slate-300 shadow-none cursor-not-allowed"
                        }`}
                      >
                        {loading === s.id ? "Memproses..." : s.isAttendanceOpen ? "Klik Untuk Presensi" : "Menunggu Guru Membuka Absensi"}
                      </button>
                    ) : (
                      <div className="w-full py-5 rounded-[24px] bg-emerald-50 border border-emerald-100 text-emerald-600 font-black uppercase tracking-widest text-[11px] text-center flex items-center justify-center gap-2">
                         <CheckCircle2 size={16}/> Kehadiran Tercatat
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* HISTORY */}
      <section>
        <div className="flex items-center gap-3 mb-6">
           <History className="text-[#8B0000]" size={20} />
           <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Riwayat Presensi Saya</h2>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sesi / Topik</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mata Kuliah</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu Presensi</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-[10px]">Belum ada riwayat presensi</td>
                  </tr>
                ) : (
                  history.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                         <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{h.schedule?.topic || "Live Session"}</p>
                         <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{h.schedule?.date ? new Date(h.schedule.date).toLocaleDateString() : "-"}</p>
                      </td>
                      <td className="px-8 py-6">
                         <span className="text-xs font-bold text-slate-600">{h.course.title}</span>
                      </td>
                      <td className="px-8 py-6">
                         <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(h.checkedAt).toLocaleString('id-ID', { hour:'2-digit', minute:'2-digit', day:'numeric', month:'short' })}</span>
                      </td>
                      <td className="px-8 py-6">
                         <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            h.status === 'HADIR' ? "bg-emerald-50 text-emerald-600" :
                            h.status === 'IZIN' ? "bg-amber-50 text-amber-600" :
                            "bg-slate-100 text-slate-400"
                         }`}>
                           {h.status}
                         </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
