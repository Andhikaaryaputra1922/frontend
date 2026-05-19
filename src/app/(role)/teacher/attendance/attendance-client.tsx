"use client";

import { useState, useCallback } from "react";
import { 
  Calendar, Clock, User, CheckCircle2, XCircle, 
  PlayCircle, StopCircle, Users, Plus, ChevronRight,
  MoreVertical, Edit3, Trash2, MapPin
} from "lucide-react";
import { Toast } from "@/shared/components/ui/PremiumFeedback";

type Schedule = {
  id: string;
  courseId: string;
  batchId: string | null;
  topic: string | null;
  date: string;
  startTime: string;
  endTime: string;
  meetingLink: string | null;
  isAttendanceOpen: boolean;
  attendanceClosedAt: string | null;
  course: { title: string };
  batch: { name: string } | null;
};

type Attendance = {
  id: string;
  studentId: string;
  status: string;
  notes: string | null;
  checkedAt: string;
  latitude: number | null;
  longitude: number | null;
  student: { id: string; name: string; image: string | null; email: string };
};

type Props = {
  initialSchedules: Schedule[];
  courses: { id: string; title: string }[];
  batches: { id: string; name: string }[];
};

export default function TeacherAttendanceClient({ initialSchedules, courses, batches }: Props) {
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [activeSession, setActiveSession] = useState<Schedule | null>(null);
  const [sessionAttendances, setSessionAttendances] = useState<Attendance[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  // Form states for new session
  const [newSession, setNewSession] = useState({
    courseId: courses[0]?.id || "",
    batchId: "",
    topic: "",
    date: new Date().toISOString().split('T')[0],
    startTime: "19:00",
    endTime: "21:00",
    meetingLink: ""
  });

  const showToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateSession = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSession)
      });
      if (res.ok) {
        const data = await res.json();
        setSchedules([data.schedule, ...schedules]);
        setIsModalOpen(false);
        showToast("Sesi berhasil dibuat!");
      } else {
        showToast("Gagal membuat sesi", "error");
      }
    } catch (e) {
      showToast("Error sistem", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAttendance = async (id: string, isOpen: boolean) => {
    const action = isOpen ? "close" : "open";
    try {
      const res = await fetch(`/api/teacher/attendance/sessions/${id}/${action}`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setSchedules(schedules.map(s => s.id === id ? data.session : s));
        if (activeSession?.id === id) setActiveSession(data.session);
        showToast(`Presensi ${isOpen ? "ditutup" : "dibuka"}!`);
      }
    } catch (e) {
      showToast("Gagal mengubah status presensi", "error");
    }
  };

  const viewSessionDetail = async (session: Schedule) => {
    setActiveSession(session);
    setLoading(true);
    try {
      const res = await fetch(`/api/teacher/attendance/sessions/${session.id}`);
      if (res.ok) {
        const data = await res.json();
        setSessionAttendances(data.session.attendances || []);
        setEnrolledStudents(data.enrolledStudents || []);
      }
    } catch (e) {
      showToast("Gagal memuat data presensi", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateAttendance = async (studentId: string, status: string, notes: string = "") => {
    if (!activeSession) return;
    try {
      const res = await fetch("/api/teacher/attendance/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleId: activeSession.id,
          studentId,
          status,
          notes
        })
      });
      if (res.ok) {
        const data = await res.json();
        const updated = data.attendance;
        setSessionAttendances(prev => {
          const idx = prev.findIndex(a => a.studentId === studentId);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx], ...updated };
            return next;
          }
          return [...prev, updated];
        });
        showToast(`Status updated: ${status}`);
      }
    } catch (e) {
      showToast("Gagal mengupdate presensi", "error");
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Action Bar */}
      <div className="flex justify-end">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 bg-[#0B213F] text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-xl hover:bg-[#0B213F] transition-all hover:-translate-y-1 active:scale-95"
        >
          <Plus size={18} strokeWidth={3} /> Buat Sesi Live
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Session List */}
        <div className={`space-y-4 ${activeSession ? "lg:col-span-4" : "lg:col-span-12"}`}>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Daftar Sesi Terjadwal</p>
          <div className="grid grid-cols-1 gap-4">
            {schedules.map((s) => (
              <div 
                key={s.id}
                onClick={() => viewSessionDetail(s)}
                className={`group p-6 rounded-2xl border-2 transition-all cursor-pointer ${activeSession?.id === s.id ? "bg-white border-[#0B213F] shadow-xl" : "bg-white border-transparent hover:border-slate-200 hover:shadow-lg"}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-black text-slate-800 uppercase tracking-tight leading-tight">{s.topic || "Sesi Live Class"}</h3>
                    <p className="text-[11px] font-bold text-[#0B213F] mt-1 uppercase tracking-wider">{s.course?.title || "Unknown Course"}</p>
                    <div className="flex items-center gap-3 mt-3 text-slate-400">
                       <span className="text-[10px] font-bold flex items-center gap-1"><Calendar size={12}/> {new Date(s.date).toLocaleDateString()}</span>
                       <span className="text-[10px] font-bold flex items-center gap-1"><Clock size={12}/> {s.startTime}</span>
                    </div>
                  </div>
                  <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${s.isAttendanceOpen ? "bg-emerald-50 text-emerald-500 animate-pulse" : "bg-slate-50 text-slate-300"}`}>
                    {s.isAttendanceOpen ? <PlayCircle size={20} /> : <StopCircle size={20} />}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{s.batch?.name || "Global"}</span>
                  <ChevronRight size={14} className={`transition-transform ${activeSession?.id === s.id ? "rotate-90 text-[#0B213F]" : "text-slate-300"}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail & Attendance List */}
        {activeSession ? (
          <div className="lg:col-span-8 space-y-6 animate-in slide-in-from-right-10 duration-500">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
              <div className="p-10 bg-slate-900 text-white relative">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-4 py-1.5 rounded-full bg-[#0B213F] text-[9px] font-black uppercase tracking-widest">Live Session</span>
                    {activeSession.batch && <span className="px-4 py-1.5 rounded-full bg-white/10 text-[9px] font-black uppercase tracking-widest">{activeSession.batch.name}</span>}
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tight mb-2">{activeSession.topic || "Tanpa Judul Sesi"}</h2>
                  <p className="text-white/60 font-medium text-sm">{activeSession.course?.title || "Unknown Course"}</p>
                  
                  <div className="mt-8 flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2">
                       <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center"><Calendar size={14}/></div>
                       <span className="text-xs font-bold">{new Date(activeSession.date).toLocaleDateString('id-ID', { day:'numeric', month:'long' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center"><Clock size={14}/></div>
                       <span className="text-xs font-bold">{activeSession.startTime} - {activeSession.endTime}</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 p-10 flex flex-col items-end gap-4">
                  <button 
                    onClick={() => handleToggleAttendance(activeSession.id, activeSession.isAttendanceOpen)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSession.isAttendanceOpen ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20" : "bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"}`}
                  >
                    {activeSession.isAttendanceOpen ? <><StopCircle size={16}/> Tutup Absensi</> : <><PlayCircle size={16}/> Buka Absensi</>}
                  </button>
                  <button onClick={() => setActiveSession(null)} className="text-white/40 hover:text-white transition-colors"><XCircle size={24}/></button>
                </div>
              </div>

              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                   <div>
                     <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">Data Kehadiran Siswa</h4>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total {enrolledStudents.length} Siswa Terdaftar di Angkatan Ini</p>
                   </div>
                   <div className="flex items-center gap-6">
                      <div className="text-center">
                         <p className="text-2xl font-black text-emerald-500">{sessionAttendances.filter(a => a.status === 'HADIR').length}</p>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hadir</p>
                      </div>
                      <div className="text-center">
                         <p className="text-2xl font-black text-amber-500">{sessionAttendances.filter(a => a.status === 'IZIN').length}</p>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Izin</p>
                      </div>
                      <div className="text-center">
                         <p className="text-2xl font-black text-red-500">{enrolledStudents.length - sessionAttendances.filter(a => a.status === 'HADIR' || a.status === 'IZIN').length}</p>
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Alpa</p>
                      </div>
                   </div>
                </div>

                <div className="divide-y divide-slate-50 border-t border-slate-50">
                  {enrolledStudents.map((student) => {
                    const att = sessionAttendances.find(a => a.studentId === student.id);
                    return (
                      <div key={student.id} className="py-6 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-slate-100 overflow-hidden">
                            {student.image ? <img src={student.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={20}/></div>}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800">{student.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{student.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {att?.latitude && (
                            <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#0B213F] transition-colors cursor-help" title={`Geo: ${att.latitude}, ${att.longitude}`}>
                              <MapPin size={14} />
                            </div>
                          )}
                          <select 
                            value={att?.status || "ALPA"}
                            onChange={(e) => updateAttendance(student.id, e.target.value)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none border transition-all ${
                              att?.status === 'HADIR' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                              att?.status === 'IZIN' ? "bg-amber-50 text-amber-600 border-amber-100" :
                              att?.status === 'SAKIT' ? "bg-blue-50 text-blue-600 border-blue-100" :
                              "bg-slate-50 text-slate-400 border-slate-100"
                            }`}
                          >
                            <option value="HADIR">HADIR</option>
                            <option value="IZIN">IZIN</option>
                            <option value="SAKIT">SAKIT</option>
                            <option value="ALPA">ALPA</option>
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 flex flex-col items-center justify-center p-20 bg-white rounded-2xl border border-slate-100 text-center">
             <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Users size={40} className="text-slate-200" />
             </div>
             <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Pilih Sesi</h3>
             <p className="text-slate-400 font-medium mt-2 max-w-xs">Pilih salah satu sesi di sebelah kiri untuk mengelola daftar kehadiran siswa.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                <div>
                   <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Buat Sesi Live Baru</h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Jadwalkan pertemuan kelas live class Anda.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors"><XCircle/></button>
             </div>
             <div className="p-10 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mata Kuliah</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0B213F]/10"
                      value={newSession.courseId}
                      onChange={(e) => setNewSession({...newSession, courseId: e.target.value})}
                    >
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Angkatan / Batch</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0B213F]/10"
                      value={newSession.batchId}
                      onChange={(e) => setNewSession({...newSession, batchId: e.target.value})}
                    >
                      <option value="">-- Pilih Angkatan --</option>
                      {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Topik Pertemuan</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: Pertemuan 1 - Pengenalan Dasar"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0B213F]/10"
                      value={newSession.topic}
                      onChange={(e) => setNewSession({...newSession, topic: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tanggal</label>
                    <input 
                      type="date" 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0B213F]/10"
                      value={newSession.date}
                      onChange={(e) => setNewSession({...newSession, date: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Mulai</label>
                       <input 
                         type="time" 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0B213F]/10"
                         value={newSession.startTime}
                         onChange={(e) => setNewSession({...newSession, startTime: e.target.value})}
                       />
                    </div>
                    <div className="flex-1">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Selesai</label>
                       <input 
                         type="time" 
                         className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#0B213F]/10"
                         value={newSession.endTime}
                         onChange={(e) => setNewSession({...newSession, endTime: e.target.value})}
                       />
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleCreateSession}
                  disabled={loading}
                  className="w-full bg-[#0B213F] text-white py-5 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-[#0B213F]/10 hover:bg-#0d2847 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? "Menyimpan..." : "Simpan Jadwal Sesi"}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
