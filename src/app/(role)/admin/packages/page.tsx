"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit3, Trash2, Check, Book, User, Clock, Package } from "lucide-react";
import { PremiumModal, Toast } from "@/shared/components/ui/PremiumFeedback";
import AdminPageLayout, { AdminButton } from "@/features/users/components/layouts/AdminPageLayout";

// ── Types ────────────────────────────────────────────────────────
interface Teacher { id: string; name: string }
interface Course {
  id: string;
  title: string;
  teachers: Teacher[];
}
interface PackageCourse {
  courseId: string;
  batchId?: string | null;
  course: Course;
}
interface Pkg {
  id: string;
  name: string;
  description: string | null;
  price: number;
  defaultLessonLimit: number;
  durationInDays?: number;
  isActive: boolean;
  packageCourses: PackageCourse[];
  batch?: { id: string; name: string };
  batchId?: string;
  classSchedule?: string | null;
}

// ── Default form state ───────────────────────────────────────────
const DEFAULT_FORM = {
  id: "",
  name: "",
  description: "",
  price: "0",
  durationInDays: "0",
  batchId: "",
  courseIds: [] as string[],
  isActive: true,
  classSchedule: "",
};

// ── Page ─────────────────────────────────────────────────────────
export default function AdminPackagesPage() {
  const [packages, setPackages]     = useState<Pkg[]>([]);
  const [published, setPublished]   = useState<Course[]>([]);
  const [batches, setBatches]       = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState<{ message: string; type: "success"|"error"|"info" }|null>(null);

  const [pkgSearch, setPkgSearch]       = useState("");
  const [courseSearch, setCourseSearch] = useState("");

  const [showModal, setShowModal]   = useState(false);
  const [isEditing, setIsEditing]   = useState(false);
  const [saving, setSaving]         = useState(false);
  const [form, setForm]             = useState({ ...DEFAULT_FORM });

  const [delModal, setDelModal]     = useState({ open: false, id: "", name: "" });
  const [deleting, setDeleting]     = useState(false);

  // ── Fetch ───────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pkgRes, crsRes, btcRes] = await Promise.all([
        fetch("/api/admin/packages",              { credentials: "include" }),
        fetch("/api/courses?status=PUBLISHED",    { credentials: "include" }),
        fetch("/api/batches",                     { credentials: "include" }),
      ]);
      if (pkgRes.ok) setPackages((await pkgRes.json().catch(() => ({}))).packages ?? []);
      if (crsRes.ok) setPublished((await crsRes.json().catch(() => ({}))).courses  ?? []);
      if (btcRes.ok) setBatches((await btcRes.json().catch(() => ({}))).batches    ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Helpers ─────────────────────────────────────────────────────
  const showToast = (message: string, type: "success"|"error"|"info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getTeachers = (pkg: Pkg): string[] => {
    const names = new Set<string>();
    pkg.packageCourses?.forEach(pc =>
      pc.course?.teachers?.forEach(t => t?.name && names.add(t.name))
    );
    return [...names];
  };

  const openCreate = () => {
    setIsEditing(false);
    setForm({ ...DEFAULT_FORM });
    setCourseSearch("");
    setShowModal(true);
  };

  const openEdit = (pkg: Pkg) => {
    setIsEditing(true);
    setForm({
      id:            pkg.id,
      name:          pkg.name,
      description:   pkg.description ?? "",
      batchId:       pkg.batchId ?? "",
      price:         pkg.price?.toString() ?? "0",
      durationInDays: (pkg.defaultLessonLimit ?? pkg.durationInDays ?? 0).toString(),
      courseIds:     pkg.packageCourses?.map(pc => pc.courseId) ?? [],
      isActive:      pkg.isActive,
      classSchedule: pkg.classSchedule ?? "",
    });
    setCourseSearch("");
    setShowModal(true);
  };

  const toggleCourse = (id: string) =>
    setForm(prev => ({
      ...prev,
      courseIds: prev.courseIds.includes(id)
        ? prev.courseIds.filter(c => c !== id)
        : [...prev.courseIds, id],
    }));

  // ── Save ────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.courseIds.length === 0) return showToast("Pilih minimal satu mata pelajaran", "error");
    if (!form.batchId)               return showToast("Silakan pilih Batch untuk paket ini", "error");
    setSaving(true);
    try {
      const url    = isEditing ? `/api/admin/packages/${form.id}` : "/api/admin/packages";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:          form.name,
          batchId:       form.batchId,
          description:   form.description,
          price:         Number(form.price),
          defaultLessonLimit: Number(form.durationInDays),
          durationInDays: Number(form.durationInDays), // Send both just in case
          isActive:      form.isActive,
          courseIds:     form.courseIds,
          classSchedule: form.classSchedule,
        }),
      });
      if (res.ok) {
        showToast(isEditing ? "Paket diperbarui" : "Paket berhasil dibuat");
        setShowModal(false);
        load();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message ?? "Gagal menyimpan", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/admin/packages/${delModal.id}`, { method: "DELETE", credentials: "include" });
      showToast("Paket dihapus");
      setDelModal({ open: false, id: "", name: "" });
      load();
    } finally {
      setDeleting(false);
    }
  };

  const visiblePkgs    = packages.filter(p => p.name.toLowerCase().includes(pkgSearch.toLowerCase()));
  const visibleCourses = published.filter(c => c.title.toLowerCase().includes(courseSearch.toLowerCase()));

  // ── Render ──────────────────────────────────────────────────────
  return (
    <AdminPageLayout
      title="Manajemen Paket"
      subtitle="Bundling mapel yang sudah terbit, tentukan harga, dan tampilkan ke siswa."
      action={
        <AdminButton onClick={openCreate}>
          <Plus size={14} /> Buat Paket
        </AdminButton>
      }
    >
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <PremiumModal
        isOpen={delModal.open}
        onClose={() => setDelModal({ open: false, id: "", name: "" })}
        onConfirm={handleDelete}
        title="Hapus Paket"
        message={`Hapus paket "${delModal.name}"? Siswa yang sudah membeli tidak terpengaruh.`}
        type="delete"
        loading={deleting}
      />

      {/* ── Search ── */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
        <input
          type="text"
          placeholder="Cari paket..."
          value={pkgSearch}
          onChange={e => setPkgSearch(e.target.value)}
          className="w-full pl-11 pr-5 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]/50 transition-all shadow-sm"
        />
      </div>

        {/* ── Package Cards ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => <div key={i} className="h-60 rounded-xl bg-slate-100 animate-pulse" />)}
          </div>
        ) : visiblePkgs.length === 0 ? (
          <div className="py-24 text-center">
            <div className="h-16 w-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Package size={28} className="text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-400">Belum ada paket</p>
            <p className="text-xs text-slate-300 mt-1">Klik "Buat Paket" untuk mulai</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visiblePkgs.map(pkg => (
              <div key={pkg.id} className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col overflow-hidden">
                <div className="p-6 flex-1 space-y-4">

                  {/* Status + Durasi */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg ${pkg.isActive ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-400"}`}>
                      {pkg.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-semibold text-slate-400 uppercase">
                      <Clock size={11} />
                      {(pkg.defaultLessonLimit ?? pkg.durationInDays ?? 0) > 0 ? `${pkg.defaultLessonLimit ?? pkg.durationInDays} hari` : "Selamanya"}
                    </span>
                  </div>

                  {/* Nama & Harga */}
                  <div>
                    <h3 className="text-base font-bold text-[#0B213F] tracking-tight leading-tight">{pkg.name}</h3>
                    {pkg.batch && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[9px] font-bold uppercase tracking-wider border border-blue-100">
                        Batch: {pkg.batch.name}
                      </span>
                    )}
                    <p className="text-sm font-bold text-[#D4AF37] mt-1">Rp {pkg.price.toLocaleString("id-ID")}</p>
                    {pkg.classSchedule && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                        <Clock size={10} />
                        {pkg.classSchedule}
                      </div>
                    )}
                  </div>

                  {/* Daftar Mapel */}
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Book size={11} /> Mata Pelajaran ({pkg.packageCourses?.length ?? 0})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {pkg.packageCourses?.map(pc => (
                        <span key={pc.courseId} className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[8px] font-semibold text-slate-500 uppercase">
                          {pc.course?.title}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tim Pengajar */}
                  <div className="border-t border-slate-100 pt-3 space-y-1">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <User size={11} className="text-[#D4AF37]" /> Tim Pengajar
                    </p>
                    <p className="text-[10px] font-semibold text-slate-600">
                      {getTeachers(pkg).join(" · ") || "—"}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 pb-4 flex gap-2 border-t border-slate-50">
                  <button
                    onClick={() => openEdit(pkg)}
                    className="flex-1 py-2.5 mt-3 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-[#0B213F] hover:border-[#0B213F]/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => setDelModal({ open: true, id: pkg.id, name: pkg.name })}
                    className="p-2.5 mt-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      {/* ══════════════════════════════════════════════════════
          MODAL — Buat / Edit Paket
      ══════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0B213F]/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">

            {/* Modal header */}
            <div className="sticky top-0 bg-white rounded-t-2xl px-7 pt-7 pb-5 border-b border-slate-100 flex justify-between items-start z-10">
              <div>
                <h3 className="text-lg font-bold text-[#0B213F] tracking-tight">
                  {isEditing ? "Edit Paket" : "Buat Paket Baru"}
                </h3>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">
                  Centang mapel yang sudah terbit → atur harga
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSave} className="px-7 py-6 space-y-5">

              {/* Batch Angkatan */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Batch Angkatan <span className="text-red-400">*</span></label>
                <select
                  required
                  value={form.batchId}
                  onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]/50 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="" disabled>-- Pilih Batch (Wajib) --</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Nama Paket */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Nama Paket <span className="text-red-400">*</span></label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Contoh: Paket Tahfidz + Arab"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]/50 focus:bg-white transition-all"
                />
              </div>

              {/* Jadwal Kelas */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Jadwal Kelas <span className="text-slate-300">(Opsional)</span></label>
                <input
                  value={form.classSchedule}
                  onChange={e => setForm(p => ({ ...p, classSchedule: e.target.value }))}
                  placeholder="Contoh: Pagi 08:00-10:00, Malam 19:00-21:00"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]/50 focus:bg-white transition-all"
                />
              </div>

              {/* Harga + Durasi */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Harga (Rp) <span className="text-red-400">*</span></label>
                  <input
                    type="number" required min="0"
                    value={form.price}
                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    placeholder="150000"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]/50 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Masa Aktif (Hari)</label>
                  <input
                    type="number" min="0" required
                    value={form.durationInDays}
                    onChange={e => setForm(p => ({ ...p, durationInDays: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]/50 focus:bg-white transition-all"
                  />
                  <p className="text-[9px] text-slate-400 ml-1">0 = selamanya</p>
                </div>
              </div>

              {/* Pilihan Mapel */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                  Pilih Mata Pelajaran&nbsp;
                  <span className="text-[#D4AF37]">({form.courseIds.length} dipilih)</span>
                  &nbsp;— hanya yang sudah diterbitkan
                </label>
                <div className="relative">
                  <Search size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="text"
                    placeholder="Cari nama mapel..."
                    value={courseSearch}
                    onChange={e => setCourseSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 transition-all"
                  />
                </div>
                {visibleCourses.length === 0 ? (
                  <div className="py-6 text-center text-[10px] font-semibold text-slate-400">
                    Tidak ada mapel terbit — terbitkan dahulu di menu Mata Pelajaran
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                    {visibleCourses.map(c => {
                      const selected = form.courseIds.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => toggleCourse(c.id)}
                          className={`flex items-center justify-between p-3.5 rounded-xl border-2 text-left transition-all ${
                            selected
                              ? "border-[#D4AF37] bg-[#D4AF37]/5 shadow-sm"
                              : "border-slate-200 bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          <div className="min-w-0 flex-1 pr-3">
                            <p className="text-[10px] font-bold text-[#0B213F] uppercase truncate">{c.title}</p>
                            {c.teachers?.length > 0 && (
                              <p className="text-[8px] font-semibold text-slate-400 truncate mt-0.5">
                                {c.teachers.map(t => t.name).join(", ")}
                              </p>
                            )}
                          </div>
                          <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 transition-all border ${
                            selected ? "bg-[#D4AF37] border-[#D4AF37]" : "bg-white border-slate-300"
                          }`}>
                            {selected && <Check size={10} className="text-white" strokeWidth={3} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Deskripsi */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Deskripsi <span className="text-slate-300">(Opsional)</span></label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Jelaskan isi paket ini..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 font-medium text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]/50 focus:bg-white transition-all"
                />
              </div>

              {/* Toggle Aktif */}
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 accent-[#0B213F]"
                />
                <span className="text-[11px] font-semibold text-slate-600">
                  Tampilkan paket ini ke siswa (etalase)
                </span>
              </label>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-[11px] uppercase tracking-wider text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving || form.courseIds.length === 0}
                  className="flex-1 py-3 rounded-xl bg-[#0B213F] text-[#D4AF37] font-bold text-[11px] uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-sm disabled:opacity-40"
                >
                  {saving ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Buat Paket"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </AdminPageLayout>
  );
}
