"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Edit3, Trash2, Check, Package as PackageIcon, Book, User, Clock } from "lucide-react";
import { PremiumModal, Toast } from "@/shared/components/ui/PremiumFeedback";

// ── Types ────────────────────────────────────────────────────────
interface Teacher { id: string; name: string }
interface Course {
  id: string;
  title: string;
  teachers: Teacher[];
}
interface PackageCourse {
  courseId: string;
  course: Course;
}
interface Pkg {
  id: string;
  name: string;
  description: string | null;
  price: number;
  defaultLessonLimit: number; // mapped from backend
  durationInDays?: number;    // legacy/compat fallback
  isActive: boolean;
  packageCourses: PackageCourse[];
}

// ── Default form state ───────────────────────────────────────────
const DEFAULT_FORM = {
  id: "",
  name: "",
  description: "",
  price: "",
  durationInDays: "0",
  courseIds: [] as string[],
  isActive: true,
};

// ── Page ─────────────────────────────────────────────────────────
export default function AdminPackagesPage() {
  const [packages, setPackages]     = useState<Pkg[]>([]);
  const [published, setPublished]   = useState<Course[]>([]); // only PUBLISHED courses
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState<{ message: string; type: "success"|"error"|"info" }|null>(null);

  // Search states
  const [pkgSearch, setPkgSearch]       = useState("");
  const [courseSearch, setCourseSearch] = useState("");

  // Modal states
  const [showModal, setShowModal]   = useState(false);
  const [isEditing, setIsEditing]   = useState(false);
  const [saving, setSaving]         = useState(false);
  const [form, setForm]             = useState({ ...DEFAULT_FORM });

  // Delete modal
  const [delModal, setDelModal]     = useState({ open: false, id: "", name: "" });
  const [deleting, setDeleting]     = useState(false);

  // ── Fetch data ──────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pkgRes, crsRes] = await Promise.all([
        fetch("/api/admin/packages",              { credentials: "include" }),
        fetch("/api/courses?status=PUBLISHED",    { credentials: "include" }),  // ← only published!
      ]);
      if (pkgRes.ok) setPackages((await pkgRes.json().catch(() => ({}))).packages ?? []);
      if (crsRes.ok) setPublished((await crsRes.json().catch(() => ({}))).courses  ?? []);

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

  // collect unique teacher names across all courses in a package
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
      price:         pkg.price?.toString() ?? "0",
      durationInDays: (pkg.defaultLessonLimit ?? pkg.durationInDays ?? 0).toString(),
      courseIds:     pkg.packageCourses?.map(pc => pc.courseId) ?? [],
      isActive:      pkg.isActive,
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
    if (form.courseIds.length === 0) {
      return showToast("Pilih minimal satu mata pelajaran", "error");
    }
    setSaving(true);
    try {
      const url    = isEditing ? `/api/admin/packages/${form.id}` : "/api/admin/packages";
      const method = isEditing ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:          form.name,
          description:   form.description,
          price:         Number(form.price),
          durationInDays: Number(form.durationInDays),
          isActive:      form.isActive,
          courseIds:     form.courseIds,
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

  // ── Filtered lists ──────────────────────────────────────────────
  const visiblePkgs     = packages.filter(p => p.name.toLowerCase().includes(pkgSearch.toLowerCase()));
  const visibleCourses  = published.filter(c => c.title.toLowerCase().includes(courseSearch.toLowerCase()));

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-500">
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

      {/* ── Header ── */}
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1 w-6 rounded-full bg-[#8B0000] inline-block" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Bundle &amp; Harga</span>
            </div>
            <h1 className="text-3xl font-black text-[#1A2E44] uppercase tracking-tighter">
              Manajemen <span className="text-[#8B0000]">Paket</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium mt-1">
              Bundling mapel yang sudah terbit → tentukan harga → tampilkan ke siswa
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#1A2E44] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#8B0000] transition-all shadow-xl active:scale-95"
          >
            <Plus size={16} strokeWidth={3} /> Buat Paket
          </button>
        </header>

        {/* ── Search ── */}
        <div className="relative mb-8">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input
            type="text"
            placeholder="Cari paket..."
            value={pkgSearch}
            onChange={e => setPkgSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-100 bg-white font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#8B0000]/5"
          />
        </div>

        {/* ── Package cards ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-64 rounded-[32px] bg-slate-50 animate-pulse" />)}
          </div>
        ) : visiblePkgs.length === 0 ? (
          <div className="py-24 text-center text-[10px] font-black text-slate-200 uppercase tracking-[0.4em]">
            Belum ada paket — klik "Buat Paket" untuk mulai
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visiblePkgs.map(pkg => (
              <div key={pkg.id} className="group bg-white rounded-[36px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col overflow-hidden">
                <div className="p-7 flex-1 space-y-4">
                  {/* Status + Durasi */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${pkg.isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                      {pkg.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                    <span className="flex items-center gap-1 text-[9px] font-black text-slate-300 uppercase">
                      <Clock size={11} />
                      {(pkg.defaultLessonLimit ?? pkg.durationInDays ?? 0) > 0 ? `${pkg.defaultLessonLimit ?? pkg.durationInDays} hari` : "Selamanya"}
                    </span>
                  </div>

                  {/* Nama & Harga */}
                  <div>
                    <h3 className="text-lg font-black text-[#1A2E44] uppercase tracking-tight leading-tight">{pkg.name}</h3>
                    <p className="text-[11px] font-black text-[#8B0000] mt-0.5">Rp {pkg.price.toLocaleString("id-ID")}</p>
                  </div>

                  {/* Daftar Mapel */}
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Book size={11} /> Mata Pelajaran ({pkg.packageCourses?.length ?? 0})
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {pkg.packageCourses?.map(pc => (
                        <span key={pc.courseId} className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-100 text-[8px] font-bold text-slate-500 uppercase">
                          {pc.course?.title}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tim Pengajar */}
                  <div className="border-t border-slate-50 pt-3 space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <User size={11} className="text-[#E5B54F]" /> Tim Pengajar
                    </p>
                    <p className="text-[9px] font-black text-[#1A2E44] uppercase leading-relaxed">
                      {getTeachers(pkg).join(" · ") || "—"}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 pb-4 flex gap-2">
                  <button
                    onClick={() => openEdit(pkg)}
                    className="flex-1 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase text-slate-400 hover:text-[#1A2E44] hover:border-[#1A2E44] transition-all flex items-center justify-center gap-1.5"
                  >
                    <Edit3 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => setDelModal({ open: true, id: pkg.id, name: pkg.name })}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-300 hover:text-red-500 hover:border-red-200 transition-all"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          MODAL — Buat / Edit Paket
          Hanya menampilkan mapel yang sudah PUBLISHED (lolos moderasi)
      ═══════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1A2E44]/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">

            {/* Modal header */}
            <div className="sticky top-0 bg-white rounded-t-[40px] px-8 pt-8 pb-5 border-b border-slate-50 flex justify-between items-start z-10">
              <div>
                <h3 className="text-xl font-black text-[#1A2E44] uppercase tracking-tighter">
                  {isEditing ? "Edit Paket" : "Buat Paket Baru"}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Centang mapel yang sudah terbit → atur harga
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-300 hover:text-[#8B0000] mt-1">
                <Plus size={22} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSave} className="px-8 py-6 space-y-6">

              {/* ── Nama Paket ── */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Nama Paket *</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Contoh: Paket Tahfidz + Arab"
                  className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#8B0000]/5"
                />
              </div>

              {/* ── Harga + Durasi ── */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Harga (Rp) *</label>
                  <input
                    type="number" required min="0"
                    value={form.price}
                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    placeholder="150000"
                    className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#8B0000]/5"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Masa Aktif (Hari, 0 = Selamanya)</label>
                  <input
                    type="number" min="0" required
                    value={form.durationInDays}
                    onChange={e => setForm(p => ({ ...p, durationInDays: e.target.value }))}
                    className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#8B0000]/5"
                  />
                  <p className="text-[8px] text-slate-300 font-bold ml-1">0 = selamanya</p>
                </div>
              </div>

              {/* ══════════════════════════════════════════════════════
                  PILIHAN MAPEL — hanya yang sudah PUBLISHED
              ══════════════════════════════════════════════════════ */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Pilih Mata Pelajaran&nbsp;
                  <span className="text-[#8B0000]">({form.courseIds.length} dipilih)</span>
                  &nbsp;— hanya mapel yang sudah diterbitkan
                </label>

                {/* Search mapel */}
                <div className="relative">
                  <Search size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="text"
                    placeholder="Cari nama mapel..."
                    value={courseSearch}
                    onChange={e => setCourseSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold focus:outline-none"
                  />
                </div>

                {/* Checklist mapel */}
                {visibleCourses.length === 0 ? (
                  <div className="py-6 text-center text-[10px] font-black text-slate-200 uppercase tracking-widest">
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
                          className={`flex items-center justify-between p-4 rounded-2xl border-2 text-left transition-all ${
                            selected
                              ? "border-[#8B0000] bg-red-50/50 shadow-sm"
                              : "border-slate-100 bg-slate-50/50 hover:border-slate-200"
                          }`}
                        >
                          <div className="min-w-0 flex-1 pr-3">
                            <p className="text-[10px] font-black text-[#1A2E44] uppercase truncate">{c.title}</p>
                            {c.teachers?.length > 0 && (
                              <p className="text-[8px] font-bold text-slate-400 truncate mt-0.5">
                                {c.teachers.map(t => t.name).join(", ")}
                              </p>
                            )}
                          </div>
                          <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            selected ? "bg-[#8B0000]" : "bg-slate-100"
                          }`}>
                            {selected && <Check size={10} className="text-white" strokeWidth={3} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Deskripsi ── */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Deskripsi (Opsional)</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Jelaskan isi paket ini..."
                  rows={3}
                  className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 font-medium text-sm resize-none focus:outline-none focus:ring-4 focus:ring-[#8B0000]/5"
                />
              </div>

              {/* ── Tampilkan ke siswa ── */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-[#8B0000] focus:ring-[#8B0000]"
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Tampilkan paket ini ke siswa (etalase)
                </span>
              </label>

              {/* ── Actions ── */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 rounded-xl border border-slate-100 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving || form.courseIds.length === 0}
                  className="flex-1 py-4 rounded-xl bg-[#1A2E44] text-[#E5B54F] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#8B0000] hover:text-white transition-all shadow-xl disabled:opacity-40"
                >
                  {saving ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Buat Paket"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
