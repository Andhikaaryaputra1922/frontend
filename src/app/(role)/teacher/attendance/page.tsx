"use client";

import { useState, useEffect } from "react";
import { PremiumModal, Toast } from "@/shared/components/ui/PremiumFeedback";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  category: string;
  _count: { enrollments: number };
}

interface Student {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export default function TeacherAttendancePage() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    fetch("/api/teacher/courses", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setCourses(data.courses || []);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      setLoading(true);
      fetch(`/api/teacher/attendance/students/${selectedCourseId}`, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          setStudents(data.students || []);
          // Initialize all as HADIR
          const initial: Record<string, string> = {};
          (data.students || []).forEach((s: Student) => {
            initial[s.id] = "HADIR";
          });
          setAttendance(initial);
          setLoading(false);
        })
        .catch((err) => console.error(err));
    } else {
      setStudents([]);
    }
  }, [selectedCourseId]);

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    if (!selectedCourseId || Object.keys(attendance).length === 0) return;
    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        status,
      }));
      const res = await fetch("/api/teacher/attendance", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: selectedCourseId, records }),
      });
      if (res.ok) {
        setToast({ message: "Absensi berhasil disimpan!", type: "success" });
      } else {
        setToast({ message: "Gagal menyimpan absensi", type: "error" });
      }
    } catch {
      setToast({ message: "Kesalahan jaringan", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const statuses = [
    { key: "HADIR", label: "Hadir", color: "bg-emerald-500", light: "bg-emerald-50 text-emerald-600" },
    { key: "IZIN", label: "Izin", color: "bg-amber-500", light: "bg-amber-50 text-amber-600" },
    { key: "SAKIT", label: "Sakit", color: "bg-blue-500", light: "bg-blue-50 text-blue-600" },
    { key: "ALPA", label: "Alpa", color: "bg-rose-500", light: "bg-rose-50 text-rose-600" },
  ];

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <Link href="/teacher" className="mb-2 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#1A2E44] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="15 18 9 12 15 6"/></svg>
            Dashboard
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-[#1A2E44]">Absensi Siswa</h1>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">Manajemen Kehadiran Kelas Live</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Selection */}
          <div className="lg:col-span-1 space-y-6">
            <section className="rounded-[40px] border border-slate-100 bg-white p-8 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-[#1A2E44] mb-6">Pilih Kelas</h3>
              <div className="space-y-3">
                {courses.length === 0 && !loading ? (
                  <p className="text-xs text-slate-400">Anda belum mengampu mata pelajaran.</p>
                ) : (
                  courses.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCourseId(c.id)}
                      className={`w-full flex flex-col p-5 rounded-3xl transition-all text-left border-2 ${selectedCourseId === c.id ? "bg-[#1A2E44] border-[#E5B54F] shadow-lg shadow-[#1A2E44]/20" : "bg-slate-50 border-transparent hover:border-slate-200"}`}
                    >
                      <p className={`text-sm font-black truncate ${selectedCourseId === c.id ? "text-white" : "text-slate-800"}`}>{c.title}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-[9px] font-black uppercase tracking-widest ${selectedCourseId === c.id ? "text-[#E5B54F]" : "text-slate-400"}`}>{c.category}</span>
                        <span className={`text-[9px] font-bold ${selectedCourseId === c.id ? "text-white/60" : "text-slate-300"}`}>{c._count.enrollments} Siswa</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Student List */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedCourseId ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200 text-center px-10">
                <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>
                </div>
                <h4 className="text-lg font-black text-slate-300">Pilih Kelas Terlebih Dahulu</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">Pilih mata pelajaran di sebelah kiri untuk memunculkan daftar kehadiran siswa hari ini.</p>
              </div>
            ) : (
              <section className="rounded-[40px] border border-slate-100 bg-white p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                  <div>
                    <h3 className="text-sm font-black text-slate-800">Daftar Kehadiran</h3>
                    <p className="text-[10px] font-bold text-[#E5B54F] uppercase tracking-widest mt-0.5">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <button 
                    onClick={handleSave} 
                    disabled={saving || students.length === 0}
                    className="rounded-2xl bg-[#1A2E44] px-6 py-3 text-[10px] font-black uppercase tracking-widest text-[#E5B54F] shadow-lg shadow-[#1A2E44]/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    {saving ? "Menyimpan..." : "Simpan Absensi"}
                  </button>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {loading ? (
                    <p className="text-center py-10 text-xs font-bold text-slate-300 animate-pulse uppercase tracking-[0.2em]">Memuat Data Siswa...</p>
                  ) : students.length === 0 ? (
                    <p className="text-center py-10 text-xs font-bold text-slate-300 uppercase tracking-widest">Belum ada siswa terdaftar di kelas ini.</p>
                  ) : (
                    students.map((s) => (
                      <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-[#E5B54F]/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 shrink-0 rounded-full bg-[#1A2E44] border-2 border-[#E5B54F]/20 flex items-center justify-center text-[10px] font-black text-[#E5B54F] shadow-sm">
                            {s.image ? <img src={s.image} className="h-full w-full object-cover rounded-full" /> : s.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-800 truncate">{s.name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{s.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          {statuses.map((st) => (
                            <button
                              key={st.key}
                              onClick={() => handleStatusChange(s.id, st.key)}
                              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${attendance[s.id] === st.key ? `${st.color} text-white shadow-md shadow-${st.color}/20 scale-105` : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-100"}`}
                            >
                              {st.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </main>
  );
}
