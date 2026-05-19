"use client";

import { useEffect, useState, useCallback } from "react";
import { PremiumModal, Toast } from "@/shared/components/ui/PremiumFeedback";
import Link from "next/link";

/* ── Types ──────────────────────────────────────────── */
interface Certificate {
  id: string;
  certificateCode: string;
  issuedAt: string;
  user: { id: string; name: string; email: string };
  course: { id: string; title: string };
}

interface TeacherCourse {
  id: string;
  title: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
}

/* ── Icons ──────────────────────────────────────────── */
const IC = {
  Certificate: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15l-2 5 2 2 2-2-2-5z"/><circle cx="12" cy="12" r="3"/><path d="M8.21 13.89L7 23l5-2 5 2-1.21-9.12"/><path d="M15 7a6 6 0 0 0-6 6"/>
      <rect x="3" y="3" width="18" height="11" rx="2"/>
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
  ),
  Search: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
  ),
  ArrowLeft: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
  ),
};

export default function TeacherCertificatesPage() {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<TeacherCourse[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const [revokingCertId, setRevokingCertId] = useState<string | null>(null);
  const [revoking, setRevoking] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [certRes, courseRes] = await Promise.all([
        fetch("/api/certificates", { credentials: "include" }),
        fetch("/api/teacher/courses", { credentials: "include" }),
      ]);
      if (certRes.ok) {
        const d = await certRes.json();
        setCerts(d.certificates || []);
      }
      if (courseRes.ok) {
        const d = await courseRes.json();
        setCourses(d.courses || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedCourse) {
      setLoadingStudents(true);
      setSelectedStudents([]);
      fetch(`/api/teacher/courses/${selectedCourse}/students`, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => setStudents(data.students || []))
        .catch(console.error)
        .finally(() => setLoadingStudents(false));
    } else {
      setStudents([]);
      setSelectedStudents([]);
    }
  }, [selectedCourse]);

  const handleIssue = async () => {
    if (!selectedCourse || selectedStudents.length === 0) return;
    setIssuing(true);
    try {
      const res = await fetch("/api/certificates/bulk-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userIds: selectedStudents, courseId: selectedCourse }),
      });
      if (res.ok) {
        const d = await res.json();
        setToast({ message: d.message || "Sertifikat berhasil diterbitkan!", type: "success" });
        setShowIssueModal(false);
        setSelectedCourse("");
        setSelectedStudents([]);
        fetchData();
      } else {
        const d = await res.json();
        setToast({ message: d.message || "Gagal menerbitkan sertifikat", type: "error" });
      }
    } catch {
      setToast({ message: "Kesalahan sistem", type: "error" });
    } finally {
      setIssuing(false);
    }
  };

  const toggleStudent = (id: string) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
    }
  };

  const handleRevoke = async () => {
    if (!revokingCertId) return;
    setRevoking(true);
    try {
      const res = await fetch(`/api/certificates/${revokingCertId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setToast({ message: "Sertifikat berhasil dicabut", type: "success" });
        setRevokingCertId(null);
        fetchData();
      } else {
        const d = await res.json();
        setToast({ message: d.message || "Gagal mencabut sertifikat", type: "error" });
      }
    } catch {
      setToast({ message: "Kesalahan sistem", type: "error" });
    } finally {
      setRevoking(false);
    }
  };

  return (
    <main className="p-6 md:p-10 min-h-screen bg-[var(--base)]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block h-1.5 w-8 rounded-full bg-[#0B213F]" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#0B213F]">Manajemen</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Sertifikat Siswa</h1>
            <p className="mt-2 text-sm text-slate-500">Terbitkan dan kelola sertifikat untuk siswa berprestasi.</p>
          </div>
          <button
            onClick={() => setShowIssueModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0B213F] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#0B213F]/20 hover:bg-[#0d2847] hover:-translate-y-0.5 transition-all"
          >
            <IC.Plus /> Terbitkan Sertifikat
          </button>
        </header>

        {/* List Section */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Daftar Sertifikat Terbit</h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> {certs.length} Total
            </div>
          </div>

          {loading ? (
            <div className="p-20 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#0B213F] border-t-transparent" />
              <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat data...</p>
            </div>
          ) : certs.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                <IC.Certificate />
              </div>
              <div>
                <p className="text-base font-bold text-slate-800">Belum ada sertifikat</p>
                <p className="text-sm text-slate-500">Mulai terbitkan sertifikat untuk mengapresiasi siswa Anda.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/30">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Penerima</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Course</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">ID Sertifikat</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tanggal</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {certs.map((cert) => (
                    <tr key={cert.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900">{cert.user.name}</p>
                        <p className="text-[10px] font-medium text-slate-400">{cert.user.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-[#0B213F]/5 text-[#0B213F] text-[10px] font-bold">
                          {cert.course.title}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{cert.certificateCode}</code>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                        {new Date(cert.issuedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setRevokingCertId(cert.id)}
                          className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <IC.Trash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xl font-black text-slate-900 mb-6">Terbitkan Sertifikat</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Pilih Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#0B213F]/20 focus:border-[#0B213F] outline-none transition-all"
                >
                  <option value="">-- Pilih Mata Pelajaran --</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Pilih Siswa ({selectedStudents.length} terpilih)</label>
                  {selectedCourse && students.length > 0 && (
                    <button 
                      onClick={toggleAll}
                      className="text-[10px] font-bold text-[#0B213F] hover:underline"
                    >
                      {selectedStudents.length === students.length ? "Batal Semua" : "Pilih Semua"}
                    </button>
                  )}
                </div>
                
                <div className="max-h-[240px] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2 space-y-1">
                  {loadingStudents ? (
                    <div className="py-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Memuat siswa...</div>
                  ) : !selectedCourse ? (
                    <div className="py-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Pilih course terlebih dahulu</div>
                  ) : students.length === 0 ? (
                    <div className="py-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Tidak ada siswa terdaftar</div>
                  ) : (
                    students.map(s => (
                      <label 
                        key={s.id} 
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                          selectedStudents.includes(s.id) ? "bg-white shadow-sm ring-1 ring-slate-200" : "hover:bg-white/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(s.id)}
                          onChange={() => toggleStudent(s.id)}
                          className="h-4 w-4 rounded border-slate-300 text-[#0B213F] focus:ring-[#0B213F]"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{s.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{s.email}</p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl flex gap-3 items-start">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 mt-0.5 shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                <p className="text-[10px] font-bold text-emerald-800 leading-relaxed uppercase">Sertifikat akan otomatis muncul di dashboard siswa segera setelah diterbitkan.</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowIssueModal(false)}
                  className="flex-1 px-6 py-4 rounded-xl border border-slate-200 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button
                  disabled={selectedStudents.length === 0 || issuing}
                  onClick={handleIssue}
                  className="flex-1 px-6 py-4 rounded-xl bg-[#0B213F] text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-[#0B213F]/20 hover:bg-[#0d2847] transition-all disabled:opacity-50"
                >
                  {issuing ? "Memproses..." : "Terbitkan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Confirmation */}
      <PremiumModal
        isOpen={!!revokingCertId}
        onClose={() => setRevokingCertId(null)}
        onConfirm={handleRevoke}
        title="Cabut Sertifikat"
        message="Apakah Anda yakin ingin menarik sertifikat ini? Siswa tidak akan bisa lagi melihatnya di dashboard mereka."
        type="delete"
        confirmText="Cabut Sekarang"
        loading={revoking}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </main>
  );
}
