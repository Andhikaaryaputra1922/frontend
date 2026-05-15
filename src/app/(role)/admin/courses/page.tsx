"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, Edit3, Trash2, BookOpen, Users,
  ChevronRight, Check, ShieldCheck, Clock, X
} from "lucide-react";
import { PremiumModal, Toast } from "@/shared/components/ui/PremiumFeedback";

// ── Types ────────────────────────────────────────────────────────
interface Teacher { id: string; name: string; email: string }
interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  thumbnailUrl?: string | null;
  teachers: Teacher[];
  _count: { chapters: number; enrollments: number };
}

const DEFAULT_FORM = {
  id: "", title: "", slug: "", description: "",
  teacherIds: [] as string[],
};

// ── Page ─────────────────────────────────────────────────────────
export default function AdminCoursesPage() {
  const [courses, setCourses]   = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [teacherQ, setTeacherQ] = useState("");
  const [toast, setToast]       = useState<{ message: string; type: "success"|"error"|"info" }|null>(null);

  const [showModal, setShowModal]   = useState(false);
  const [isEditing, setIsEditing]   = useState(false);
  const [form, setForm]             = useState({ ...DEFAULT_FORM });
  const [saving, setSaving]         = useState(false);

  const [thumbnail, setThumbnail]   = useState<File | null>(null);
  const [preview, setPreview]       = useState<string | null>(null);

  const [delModal, setDelModal]     = useState({ open: false, id: "", title: "" });
  const [deleting, setDeleting]     = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [crsRes, tchrRes] = await Promise.all([
        fetch("/api/courses", { credentials: "include" }),
        fetch("/api/admin/users?role=TEACHER", { credentials: "include" }),
      ]);
      if (crsRes.ok)  setCourses((await crsRes.json().catch(() => ({}))).courses  ?? []);
      if (tchrRes.ok) setTeachers((await tchrRes.json().catch(() => ({}))).users  ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg: string, type: "success"|"error"|"info" = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // ── Save (Tambah / Edit) ─────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.teacherIds.length === 0) return showToast("Pilih minimal satu guru", "error");
    setSaving(true);
    try {
      const url    = isEditing ? `/api/admin/courses/${form.id}` : "/api/courses";
      const method = isEditing ? "PUT" : "POST";
      
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("slug", form.slug);
      fd.append("description", form.description);
      fd.append("category", "UMUM");
      fd.append("teacherIds", JSON.stringify(form.teacherIds));
      if (thumbnail) fd.append("thumbnail", thumbnail);

      const res = await fetch(url, {
        method,
        credentials: "include",
        body: fd,
      });
      
      if (res.ok) {
        showToast(isEditing ? "Mapel diperbarui" : "Mapel dibuat — menunggu moderasi");
        setShowModal(false);
        load();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message ?? "Gagal menyimpan", "error");
      }
    } finally { setSaving(false); }
  };

  // ── Delete ───────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/courses/${delModal.id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        showToast("Mapel dihapus");
        setDelModal({ open: false, id: "", title: "" });
        load();
      } else {
        showToast("Gagal menghapus", "error");
      }
    } finally { setDeleting(false); }
  };

  // ── Toggle Publish / Draft ───────────────────────────────────────
  const toggleStatus = async (c: Course) => {
    const next = c.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const res = await fetch(`/api/admin/courses/${c.id}/status`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) {
      showToast(next === "PUBLISHED" ? "Mapel diterbitkan ✓" : "Mapel ditarik ke moderasi");
      load();
    } else {
      showToast("Gagal mengubah status", "error");
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────
  const toggle = (id: string) =>
    setForm(p => ({
      ...p,
      teacherIds: p.teacherIds.includes(id)
        ? p.teacherIds.filter(t => t !== id)
        : [...p.teacherIds, id],
    }));

  const openCreate = () => {
    setIsEditing(false);
    setForm({ ...DEFAULT_FORM });
    setTeacherQ("");
    setThumbnail(null);
    setPreview(null);
    setShowModal(true);
  };

  const openEdit = (c: Course) => {
    setIsEditing(true);
    setForm({ id: c.id, title: c.title, slug: c.slug, description: c.description ?? "", teacherIds: c.teachers.map(t => t.id) });
    setTeacherQ("");
    setThumbnail(null);
    setPreview(c.thumbnailUrl || null);
    setShowModal(true);
  };

  // ── Filtered ─────────────────────────────────────────────────────
  const filtered     = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.teachers.some(t => t.name.toLowerCase().includes(search.toLowerCase()))
  );
  const drafts       = filtered.filter(c => c.status === "DRAFT");
  const published    = filtered.filter(c => c.status === "PUBLISHED");
  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(teacherQ.toLowerCase())
  );

  // ── Row component ────────────────────────────────────────────────
  const Row = ({ c }: { c: Course }) => (
    <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center gap-5 min-w-0">
        {/* Avatar atau Thumbnail */}
        {c.thumbnailUrl ? (
          <img src={c.thumbnailUrl} alt={c.title} className="h-11 w-11 rounded-xl object-cover shrink-0" />
        ) : (
          <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${c.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-500"}`}>
            {c.title.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-black text-[#1A2E44] text-sm uppercase tracking-tight group-hover:text-[#8B0000] transition-colors truncate">{c.title}</h3>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <BookOpen size={9} /> {c._count.chapters} Bab
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Users size={9} /> {c._count.enrollments} Siswa
            </span>
            {c.teachers.length > 0 && (
              <span className="text-[9px] font-bold text-slate-400 truncate max-w-[160px]">
                {c.teachers.map(t => t.name).join(", ")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-4">
        {/* Tombol Terbitkan / Tarik */}
        <button
          onClick={() => toggleStatus(c)}
          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
            c.status === "PUBLISHED"
              ? "bg-slate-50 text-slate-400 hover:bg-amber-500 hover:text-white"
              : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
          }`}
        >
          {c.status === "PUBLISHED" ? "Tarik" : "Terbitkan"}
        </button>



        {/* Edit */}
        <button
          onClick={() => openEdit(c)}
          className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-500 hover:text-white transition-all"
        >
          <Edit3 size={14} />
        </button>

        {/* Hapus */}
        <button
          onClick={() => setDelModal({ open: true, id: c.id, title: c.title })}
          className="p-2.5 rounded-xl bg-slate-50 text-slate-300 hover:bg-red-500 hover:text-white transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-500">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <PremiumModal
        isOpen={delModal.open}
        onClose={() => setDelModal({ open: false, id: "", title: "" })}
        onConfirm={handleDelete}
        title="Hapus Mapel"
        message={`Hapus "${delModal.title}"? Tindakan ini tidak bisa dibatalkan.`}
        type="delete"
        loading={deleting}
      />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1 w-6 bg-[#8B0000] rounded-full inline-block" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Moderasi & Kurikulum</span>
            </div>
            <h1 className="text-3xl font-black text-[#1A2E44] uppercase tracking-tighter">
              Mata <span className="text-[#8B0000]">Pelajaran</span>
            </h1>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#1A2E44] text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#8B0000] transition-all shadow-xl active:scale-95"
          >
            <Plus size={16} strokeWidth={3} /> Tambah Mapel
          </button>
        </header>

        {/* Search */}
        <div className="relative mb-10">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          <input
            type="text"
            placeholder="Cari mapel atau nama guru..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-100 bg-white font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#8B0000]/5"
          />
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-slate-50 animate-pulse" />)}</div>
        ) : (
          <>
            {/* ── MENUNGGU MODERASI ── */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Clock size={14} className="text-amber-500" />
                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Menunggu Moderasi <span className="text-amber-500">({drafts.length})</span>
                </h2>
              </div>
              {drafts.length === 0 ? (
                <div className="py-8 text-center text-[10px] font-black text-slate-200 uppercase tracking-[0.4em]">Tidak ada antrian</div>
              ) : (
                <div className="space-y-3">{drafts.map(c => <Row key={c.id} c={c} />)}</div>
              )}
            </section>

            {/* ── SUDAH TERBIT ── */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck size={14} className="text-emerald-500" />
                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Sudah Terbit <span className="text-emerald-500">({published.length})</span>
                </h2>
              </div>
              {published.length === 0 ? (
                <div className="py-8 text-center text-[10px] font-black text-slate-200 uppercase tracking-[0.4em]">Belum ada mapel terbit</div>
              ) : (
                <div className="space-y-3">{published.map(c => <Row key={c.id} c={c} />)}</div>
              )}
            </section>
          </>
        )}
      </div>

      {/* ════════════════════════════════════════════
          MODAL — Tambah / Edit Mapel
          ════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1A2E44]/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">

            {/* Modal Header */}
            <div className="sticky top-0 bg-white rounded-t-[40px] px-8 pt-8 pb-5 border-b border-slate-50 flex justify-between items-start z-10">
              <div>
                <h3 className="text-xl font-black text-[#1A2E44] uppercase tracking-tighter">
                  {isEditing ? "Edit Mapel" : "Mapel Baru"}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {isEditing ? "Perbarui data & tim pengajar" : "Masuk antrian moderasi setelah dibuat"}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-300 hover:text-[#8B0000] mt-1">
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSave} className="px-8 py-6 space-y-6">

              {/* Thumbnail Mapel */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Thumbnail Kursus</label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-24 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 relative">
                    {preview ? (
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-slate-300">
                        <BookOpen size={20} className="mb-1" />
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-[#1A2E44]">Pilih gambar untuk mapel</p>
                    <p className="text-[10px] font-medium text-slate-400 mt-0.5">Disarankan resolusi 1200x900px (16:9) dalam format JPG atau PNG. Maks 2MB.</p>
                  </div>
                </div>
              </div>

              {/* Nama Mapel */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Nama Mata Pelajaran *</label>
                <input
                  required
                  value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                  placeholder="Contoh: Tahfidz Al-Qur'an"
                  className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#8B0000]/5"
                />
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Slug (URL) *</label>
                <input
                  required
                  value={form.slug}
                  onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                  placeholder="tahfidz-alquran"
                  className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 font-bold text-xs focus:outline-none focus:ring-4 focus:ring-[#8B0000]/5"
                />
              </div>

              {/* Tim Pengajar — Searchable Checkbox */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Pilih Tim Pengajar&nbsp;
                  <span className="text-[#8B0000]">({form.teacherIds.length} dipilih)</span>
                </label>

                {/* Search guru */}
                <div className="relative">
                  <Search size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input
                    type="text"
                    placeholder="Cari nama guru..."
                    value={teacherQ}
                    onChange={e => setTeacherQ(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold focus:outline-none"
                  />
                </div>

                {/* Checklist guru */}
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {filteredTeachers.map(t => {
                    const sel = form.teacherIds.includes(t.id);
                    return (
                      <button
                        key={t.id} type="button" onClick={() => toggle(t.id)}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all ${sel ? "border-[#8B0000] bg-red-50/50" : "border-slate-100 bg-slate-50/50 hover:border-slate-200"}`}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-[10px] font-black text-[#1A2E44] uppercase truncate">{t.name}</p>
                          <p className="text-[8px] font-bold text-slate-400 truncate">{t.email}</p>
                        </div>
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 transition-all ${sel ? "bg-[#8B0000]" : "bg-slate-100"}`}>
                          {sel && <Check size={9} className="text-white" strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Deskripsi */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Deskripsi *</label>
                <textarea
                  required minLength={10}
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Jelaskan mengenai mata pelajaran ini..."
                  rows={4}
                  className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 font-medium text-sm resize-none focus:outline-none focus:ring-4 focus:ring-[#8B0000]/5"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-4 rounded-xl border border-slate-100 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">
                  Batal
                </button>
                <button type="submit" disabled={saving || form.teacherIds.length === 0}
                  className="flex-1 py-4 rounded-xl bg-[#1A2E44] text-[#E5B54F] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#8B0000] hover:text-white transition-all shadow-xl disabled:opacity-40">
                  {saving ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Buat & Antrikan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
