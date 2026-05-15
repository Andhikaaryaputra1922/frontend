"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface PkgCourse { courseId: string; lessonLimit: number | null; course: { id: string; title: string } }
interface Pkg { id: string; name: string; description: string | null; price: number; defaultLessonLimit: number; isActive: boolean; packageCourses: PkgCourse[] }
interface Student { id: string; name: string | null; email: string; phone: string | null; school: string | null; enrollmentId: string; status: string; startedAt: string; expiresAt: string | null }
interface CourseOption { id: string; title: string; category: string }
interface StudentOption { id: string; name: string | null; email: string }

type Tab = "students" | "courses" | "settings";

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params.packageId as string;

  const [pkg, setPkg] = useState<Pkg | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [tab, setTab] = useState<Tab>("students");
  const [loading, setLoading] = useState(true);

  // Add student modal
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentOptions, setStudentOptions] = useState<StudentOption[]>([]);
  const [addingStudent, setAddingStudent] = useState(false);
  const [expiresAtDate, setExpiresAtDate] = useState("");

  // Add course modal
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [courseLessonLimit, setCourseLessonLimit] = useState("");
  const [addingCourse, setAddingCourse] = useState(false);

  // Edit
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editLimit, setEditLimit] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchPkg = useCallback(async () => {
    try {
      const [pkgRes, studRes] = await Promise.all([
        fetch("/api/admin/packages", { credentials: "include" }),
        fetch(`/api/admin/packages/${packageId}/students`, { credentials: "include" }),
      ]);
      if (pkgRes.ok) {
        const d = await pkgRes.json().catch(() => ({}));
        const found = (d.packages ?? []).find((p: Pkg) => p.id === packageId);
        if (found) { setPkg(found); setEditName(found.name); setEditDesc(found.description ?? ""); setEditPrice(String(found.price)); setEditLimit(String(found.defaultLessonLimit)); }
      }
      if (studRes.ok) { const d = await studRes.json().catch(() => ({})); setStudents(d.students ?? []); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [packageId]);

  useEffect(() => { fetchPkg(); }, [fetchPkg]);

  // Search students for add modal
  useEffect(() => {
    if (!showAddStudent) return;
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/students?search=${encodeURIComponent(studentSearch)}`, { credentials: "include" });
        if (res.ok) { const d = await res.json().catch(() => ({})); setStudentOptions(d.students ?? []); }
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [studentSearch, showAddStudent]);

  // Fetch courses for add modal
  useEffect(() => {
    if (!showAddCourse) return;
    (async () => {
      try {
        const res = await fetch("/api/admin/courses", { credentials: "include" });
        if (res.ok) { const d = await res.json().catch(() => ({})); setCourseOptions(d.courses ?? []); }
      } catch {}
    })();
  }, [showAddCourse]);

  const addStudent = async (studentId: string) => {
    setAddingStudent(true);
    try {
      const body: any = { studentId };
      if (expiresAtDate) body.expiresAt = new Date(expiresAtDate).toISOString();

      const res = await fetch(`/api/admin/packages/${packageId}/students`, {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) { setShowAddStudent(false); setStudentSearch(""); setExpiresAtDate(""); fetchPkg(); }
      else { const e = await res.json().catch(() => ({})); alert(e.message || "Gagal"); }
    } catch { alert("Error"); } finally { setAddingStudent(false); }
  };

  const removeStudent = async (studentId: string, name: string | null) => {
    if (!confirm(`Keluarkan ${name || "siswa"} dari paket ini?`)) return;
    try {
      const res = await fetch(`/api/admin/packages/${packageId}/students/${studentId}`, { method: "DELETE", credentials: "include" });
      if (res.ok) fetchPkg(); else alert("Gagal menghapus");
    } catch { alert("Error"); }
  };

  const addCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || addingCourse) return;
    setAddingCourse(true);
    try {
      const res = await fetch(`/api/admin/packages/${packageId}/courses`, {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: selectedCourseId, lessonLimit: Number(courseLessonLimit) || undefined }),
      });
      if (res.ok) { setShowAddCourse(false); setSelectedCourseId(""); setCourseLessonLimit(""); fetchPkg(); }
      else { const e2 = await res.json().catch(() => ({})); alert(e2.message || "Gagal"); }
    } catch { alert("Error"); } finally { setAddingCourse(false); }
  };

  const removeCourse = async (courseId: string, title: string) => {
    if (!confirm(`Hapus course "${title}" dari paket ini?`)) return;
    try {
      const res = await fetch(`/api/admin/packages/${packageId}/courses/${courseId}`, { method: "DELETE", credentials: "include" });
      if (res.ok) fetchPkg(); else alert("Gagal");
    } catch { alert("Error"); }
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault(); if (saving) return; setSaving(true);
    try {
      const res = await fetch(`/api/admin/packages/${packageId}`, {
        method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, description: editDesc || undefined, price: Number(editPrice) || 0, defaultLessonLimit: Number(editLimit) || 0 }),
      });
      if (res.ok) { fetchPkg(); alert("Tersimpan!"); } else { const e2 = await res.json().catch(() => ({})); alert(e2.message || "Gagal"); }
    } catch { alert("Error"); } finally { setSaving(false); }
  };

  const deletePkg = async () => {
    if (!confirm("Nonaktifkan paket ini? Siswa yang sudah terdaftar tetap aman.")) return;
    try {
      const res = await fetch(`/api/admin/packages/${packageId}`, { method: "DELETE", credentials: "include" });
      if (res.ok) router.push("/admin/packages"); else alert("Gagal");
    } catch { alert("Error"); }
  };

  const formatPrice = (p: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(p);
  const activeStudents = students.filter(s => s.status === "ACTIVE");

  if (loading) return (
    <main className="min-h-screen bg-[var(--base)] px-6 py-10">
      <div className="mx-auto max-w-5xl flex items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
        <p className="text-sm text-[var(--muted)]">Memuat…</p>
      </div>
    </main>
  );

  if (!pkg) return (
    <main className="min-h-screen bg-[var(--base)] px-6 py-10">
      <div className="mx-auto max-w-5xl text-center py-20">
        <p className="text-lg font-bold text-[var(--text)]">Paket tidak ditemukan</p>
        <Link href="/admin/packages" className="mt-4 inline-block text-sm text-[var(--primary)] font-semibold">← Kembali</Link>
      </div>
    </main>
  );

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "students", label: `Siswa (${activeStudents.length})`, icon: "👥" },
    { key: "courses", label: `Course (${pkg.packageCourses.length})`, icon: "📚" },
    { key: "settings", label: "Pengaturan", icon: "⚙️" },
  ];

  return (
    <main className="min-h-screen bg-[var(--base)] px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-6">

        {/* Header Card */}
        <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-7 md:p-10">
          <Link href="/admin/packages" className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Manajemen Paket
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[var(--text)] md:text-3xl">{pkg.name}</h1>
              {pkg.description && <p className="mt-1 text-sm text-[var(--muted)]">{pkg.description}</p>}
            </div>
            <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${pkg.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${pkg.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
              {pkg.isActive ? "Aktif" : "Nonaktif"}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--base)] px-3 py-1.5 text-xs font-semibold text-[var(--text)]">💰 {formatPrice(Number(pkg.price))}</span>
            <span className="rounded-full bg-[var(--base)] px-3 py-1.5 text-xs font-semibold text-[var(--text)]">📖 {pkg.defaultLessonLimit <= 0 ? "Unlimited" : `${pkg.defaultLessonLimit} pertemuan`}</span>
            <span className="rounded-full bg-[var(--base)] px-3 py-1.5 text-xs font-semibold text-[var(--text)]">👥 {activeStudents.length} siswa</span>
            <span className="rounded-full bg-[var(--base)] px-3 py-1.5 text-xs font-semibold text-[var(--text)]">📚 {pkg.packageCourses.length} course</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${tab === t.key ? "bg-[var(--primary)] text-[var(--primary-ink)] shadow-lg shadow-[var(--primary)]/20" : "bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)] hover:text-[var(--text)]"}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8">

          {/* ── Students Tab ── */}
          {tab === "students" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[var(--text)]">Daftar Siswa</h2>
                <button onClick={() => setShowAddStudent(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2.5 text-xs font-semibold text-[var(--primary-ink)] transition hover:-translate-y-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Tambah Siswa
                </button>
              </div>
              {activeStudents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">👥</div>
                  <p className="font-bold text-[var(--text)]">Belum ada siswa</p>
                  <p className="text-sm text-[var(--muted)] mt-1">Klik tombol di atas untuk menambahkan siswa ke paket ini</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeStudents.map(s => (
                    <div key={s.id} className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--base)] p-4 transition hover:border-[var(--primary)]/20">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-[var(--primary-ink)]">
                          {(s.name || s.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--text)]">{s.name || "Tanpa nama"}</p>
                          <p className="text-xs text-[var(--muted)]">{s.email}{s.school ? ` · ${s.school}` : ""}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-[var(--muted)]">Sejak {new Date(s.startedAt).toLocaleDateString("id-ID")}</span>
                        <button onClick={() => removeStudent(s.id, s.name)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition">
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Courses Tab ── */}
          {tab === "courses" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[var(--text)]">Course dalam Paket</h2>
                <button onClick={() => setShowAddCourse(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2.5 text-xs font-semibold text-[var(--primary-ink)] transition hover:-translate-y-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Tambah Course
                </button>
              </div>
              {pkg.packageCourses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">📚</div>
                  <p className="font-bold text-[var(--text)]">Belum ada course</p>
                  <p className="text-sm text-[var(--muted)] mt-1">Tambahkan course yang termasuk dalam paket ini</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pkg.packageCourses.map(pc => (
                    <div key={pc.courseId} className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--base)] p-4">
                      <div>
                        <p className="text-sm font-semibold text-[var(--text)]">{pc.course.title}</p>
                        <p className="text-xs text-[var(--muted)] mt-0.5">
                          Limit: {pc.lessonLimit ? `${pc.lessonLimit} pertemuan` : `Default (${pkg.defaultLessonLimit || "∞"})`}
                        </p>
                      </div>
                      <button onClick={() => removeCourse(pc.courseId, pc.course.title)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition">
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Settings Tab ── */}
          {tab === "settings" && (
            <div>
              <h2 className="text-lg font-bold text-[var(--text)] mb-6">Pengaturan Paket</h2>
              <form onSubmit={saveSettings} className="space-y-4 max-w-lg">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">Nama Paket</label>
                  <input value={editName} onChange={e => setEditName(e.target.value)} required
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--base)] px-4 py-3 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">Deskripsi</label>
                  <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--base)] px-4 py-3 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">Harga (Rp)</label>
                    <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} min="0"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--base)] px-4 py-3 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">Jumlah Pertemuan</label>
                    <input type="number" value={editLimit} onChange={e => setEditLimit(e.target.value)} min="0"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--base)] px-4 py-3 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving}
                    className="rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-ink)] transition disabled:opacity-50">
                    {saving ? "Menyimpan…" : "Simpan Perubahan"}
                  </button>
                  <button type="button" onClick={deletePkg}
                    className="rounded-xl border border-red-200 px-6 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition">
                    Nonaktifkan Paket
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ── Add Student Modal ── */}
      {showAddStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-7 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-[var(--text)]">Tambah Siswa ke Paket</h2>
              <button onClick={() => setShowAddStudent(false)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--base)] text-[var(--muted)]">✕</button>
            </div>
            
            <div className="mb-4 space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">Cari Siswa</label>
                <input value={studentSearch} onChange={e => setStudentSearch(e.target.value)} placeholder="Nama atau email…" autoFocus
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--base)] px-4 py-3 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">Masa Berlaku Paket (Opsional)</label>
                <input type="date" value={expiresAtDate} onChange={e => setExpiresAtDate(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--base)] px-4 py-3 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40" />
                <p className="mt-1 text-[10px] text-[var(--muted)]">Kosongkan jika paket berlaku selamanya (unlimited).</p>
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {studentOptions.length === 0 ? (
                <p className="text-center py-6 text-sm text-[var(--muted)]">Tidak ada siswa ditemukan</p>
              ) : studentOptions.map(s => {
                const alreadyAdded = students.some(st => st.id === s.id && st.status === "ACTIVE");
                return (
                  <div key={s.id} className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--base)] p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-[var(--primary-ink)]">
                        {(s.name || s.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text)]">{s.name || "Tanpa nama"}</p>
                        <p className="text-xs text-[var(--muted)]">{s.email}</p>
                      </div>
                    </div>
                    {alreadyAdded ? (
                      <span className="text-xs text-emerald-600 font-semibold">Sudah terdaftar</span>
                    ) : (
                      <button onClick={() => addStudent(s.id)} disabled={addingStudent}
                        className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-[var(--primary-ink)] transition hover:opacity-90 disabled:opacity-50">
                        Tambah
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Add Course Modal ── */}
      {showAddCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-7 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-[var(--text)]">Tambah Course ke Paket</h2>
              <button onClick={() => setShowAddCourse(false)} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[var(--base)] text-[var(--muted)]">✕</button>
            </div>
            <form onSubmit={addCourse} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">Pilih Course</label>
                <select value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)} required
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--base)] px-4 py-3 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40">
                  <option value="">— Pilih course —</option>
                  {courseOptions.filter(c => !pkg.packageCourses.some(pc => pc.courseId === c.id)).map(c => (
                    <option key={c.id} value={c.id}>{c.title} ({c.category})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">Override Limit Pertemuan (opsional)</label>
                <input type="number" value={courseLessonLimit} onChange={e => setCourseLessonLimit(e.target.value)} min="0" placeholder={`Default: ${pkg.defaultLessonLimit || "unlimited"}`}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--base)] px-4 py-3 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAddCourse(false)} className="flex-1 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-semibold text-[var(--text)] hover:bg-[var(--base)]">Batal</button>
                <button type="submit" disabled={addingCourse || !selectedCourseId}
                  className="flex-1 rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-[var(--primary-ink)] disabled:opacity-50">
                  {addingCourse ? "Menambahkan…" : "Tambah Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
