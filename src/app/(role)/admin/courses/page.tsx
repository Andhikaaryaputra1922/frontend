"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Clock, ShieldCheck, BookOpen, Users, Check, Search, Edit3, Trash2 } from "lucide-react";
import { PremiumModal, Toast } from "@/shared/components/ui/PremiumFeedback";
import AdminPageLayout, {
  AdminButton, AdminModal, AdminTable,
  AdminInput, AdminTextarea, AdminSearch, StatusBadge,
} from "@/features/users/components/layouts/AdminPageLayout";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Teacher { id: string; name: string; email: string }
interface Course {
  id: string; title: string; slug: string; description: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  thumbnailUrl?: string | null;
  teachers: Teacher[];
  _count: { chapters: number; enrollments: number };
}

const EMPTY_FORM = { id: "", title: "", slug: "", description: "", teacherIds: [] as string[] };

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [teacherQ, setTeacherQ] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [delModal, setDelModal] = useState({ open: false, id: "", title: "" });
  const [deleting, setDeleting] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [crsRes, tchrRes] = await Promise.all([
        fetch("/api/courses", { credentials: "include" }),
        fetch("/api/admin/users?role=TEACHER", { credentials: "include" }),
      ]);
      if (crsRes.ok) setCourses((await crsRes.json().catch(() => ({}))).courses ?? []);
      if (tchrRes.ok) setTeachers((await tchrRes.json().catch(() => ({}))).users ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const toggleTeacher = (id: string) =>
    setForm(p => ({
      ...p,
      teacherIds: p.teacherIds.includes(id)
        ? p.teacherIds.filter(t => t !== id)
        : [...p.teacherIds, id],
    }));

  const openCreate = () => {
    setIsEditing(false); setForm({ ...EMPTY_FORM });
    setTeacherQ(""); setThumbnail(null); setPreview(null); setShowModal(true);
  };
  const openEdit = (c: Course) => {
    setIsEditing(true);
    setForm({ id: c.id, title: c.title, slug: c.slug, description: c.description ?? "", teacherIds: c.teachers.map(t => t.id) });
    setTeacherQ(""); setThumbnail(null); setPreview(c.thumbnailUrl || null); setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.teacherIds.length === 0) return showToast("Pilih minimal satu guru", "error");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("slug", form.slug);
      fd.append("description", form.description);
      fd.append("category", "UMUM");
      fd.append("teacherIds", JSON.stringify(form.teacherIds));
      if (thumbnail) fd.append("thumbnail", thumbnail);
      const res = await fetch(isEditing ? `/api/admin/courses/${form.id}` : "/api/courses", {
        method: isEditing ? "PUT" : "POST", credentials: "include", body: fd,
      });
      if (res.ok) { showToast(isEditing ? "Mapel diperbarui" : "Mapel dibuat"); setShowModal(false); load(); }
      else { const err = await res.json().catch(() => ({})); showToast(err.message ?? "Gagal menyimpan", "error"); }
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/courses/${delModal.id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) { showToast("Mapel dihapus"); setDelModal({ open: false, id: "", title: "" }); load(); }
      else showToast("Gagal menghapus", "error");
    } finally { setDeleting(false); }
  };

  const toggleStatus = async (c: Course) => {
    const next = c.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const res = await fetch(`/api/admin/courses/${c.id}/status`, {
      method: "PUT", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) { showToast(next === "PUBLISHED" ? "Mapel diterbitkan" : "Mapel ditarik"); load(); }
    else showToast("Gagal mengubah status", "error");
  };

  // ── Filtered ──────────────────────────────────────────────────────────────
  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.teachers.some(t => t.name.toLowerCase().includes(search.toLowerCase()))
  );
  const drafts = filtered.filter(c => c.status === "DRAFT");
  const published = filtered.filter(c => c.status === "PUBLISHED");
  const filteredTeachers = teachers.filter(t => t.name.toLowerCase().includes(teacherQ.toLowerCase()));

  // ── Shared course row ──────────────────────────────────────────────────────
  const CourseRow = ({ c }: { c: Course }) => (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          {c.thumbnailUrl ? (
            <img src={c.thumbnailUrl} alt={c.title} className="h-9 w-9 rounded-lg object-cover shrink-0" />
          ) : (
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${c.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
              {c.title.charAt(0)}
            </div>
          )}
          <div>
            <p className="text-[13px] font-semibold text-slate-800">{c.title}</p>
            <p className="text-[11px] text-slate-400">{c.teachers.map(t => t.name).join(", ") || "—"}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1"><BookOpen size={11} /> {c._count.chapters} bab</span>
          <span className="flex items-center gap-1"><Users size={11} /> {c._count.enrollments} siswa</span>
        </div>
      </td>
      {/* Status — read-only badge */}
      <td className="px-5 py-4">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold ${
          c.status === "PUBLISHED"
            ? "bg-emerald-50 text-emerald-600"
            : "bg-amber-50 text-amber-600"
        }`}>
          {c.status === "PUBLISHED" ? <><ShieldCheck size={10} /> Terbit</> : <><Clock size={10} /> Draft</>}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          {/* Publish / Unpublish — explicit button */}
          {c.status === "DRAFT" ? (
            <button
              onClick={() => toggleStatus(c)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-all"
            >
              <ShieldCheck size={12} /> Terbitkan
            </button>
          ) : (
            <button
              onClick={() => toggleStatus(c)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-100 transition-all"
            >
              <Clock size={12} /> Tarik
            </button>
          )}
          <button onClick={() => openEdit(c)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-all"><Edit3 size={12} /></button>
          <button onClick={() => setDelModal({ open: true, id: c.id, title: c.title })} className="rounded-lg border border-rose-100 px-3 py-1.5 text-[11px] font-medium text-rose-400 hover:bg-rose-50 transition-all"><Trash2 size={12} /></button>
        </div>
      </td>
    </tr>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AdminPageLayout
      title="Mata Pelajaran"
      subtitle="Kelola kursus dan moderasi publikasi."
      action={<AdminButton onClick={openCreate}><Plus size={14} /> Tambah Mapel</AdminButton>}
    >
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Toolbar */}
      <div className="mb-5 w-64">
        <AdminSearch value={search} onChange={setSearch} placeholder="Cari mapel atau guru..." />
      </div>

      {/* Draft section */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={13} className="text-amber-500" />
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              Menunggu Moderasi <span className="text-amber-500">({drafts.length})</span>
            </h2>
          </div>
          <AdminTable headers={["Mapel", "Statistik", "Status", "Aksi"]} loading={loading} empty={!loading && drafts.length === 0}>
            {drafts.map(c => <CourseRow key={c.id} c={c} />)}
          </AdminTable>
        </div>

        {/* Published section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={13} className="text-emerald-500" />
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              Sudah Terbit <span className="text-emerald-500">({published.length})</span>
            </h2>
          </div>
          <AdminTable headers={["Mapel", "Statistik", "Status", "Aksi"]} loading={loading} empty={!loading && published.length === 0}>
            {published.map(c => <CourseRow key={c.id} c={c} />)}
          </AdminTable>
        </div>
      </div>

      {/* ── Form Modal ── */}
      {showModal && (
        <AdminModal
          title={isEditing ? "Edit Mapel" : "Tambah Mapel Baru"}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <AdminButton variant="secondary" onClick={() => setShowModal(false)}>Batal</AdminButton>
              <AdminButton form="courseForm" type="submit" loading={saving} disabled={form.teacherIds.length === 0}>
                {isEditing ? "Simpan" : "Buat Mapel"}
              </AdminButton>
            </>
          }
        >
          <form id="courseForm" onSubmit={handleSave} className="space-y-4">
            {/* Thumbnail */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Thumbnail</label>
              <label className="flex items-center gap-4 cursor-pointer group">
                <div className="h-16 w-20 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                  {preview ? <img src={preview} className="w-full h-full object-cover" alt="preview" /> : <BookOpen size={18} className="text-slate-300" />}
                </div>
                <span className="text-[12px] text-slate-400 group-hover:text-slate-600 transition-colors">Klik untuk upload gambar (JPG/PNG)</span>
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) { setThumbnail(f); setPreview(URL.createObjectURL(f)); } }} />
              </label>
            </div>

            <AdminInput label="Nama Mata Pelajaran" required value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
              placeholder="Contoh: Tahfidz Al-Qur'an" />
            <AdminInput label="Slug (URL)" required value={form.slug}
              onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
              placeholder="tahfidz-alquran" />

            {/* Teacher picker */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
                Pengajar <span className="text-[#0B213F] normal-case">({form.teacherIds.length} dipilih)</span>
              </label>
              <div className="relative mb-2">
                <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                <input value={teacherQ} onChange={e => setTeacherQ(e.target.value)} placeholder="Cari guru..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-[12px] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
                {filteredTeachers.map(t => {
                  const sel = form.teacherIds.includes(t.id);
                  return (
                    <button key={t.id} type="button" onClick={() => toggleTeacher(t.id)}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-all ${sel ? "border-[#0B213F]/30 bg-[#0B213F]/5" : "border-slate-100 bg-slate-50 hover:border-slate-200"}`}>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-slate-800 truncate">{t.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{t.email}</p>
                      </div>
                      <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ml-2 transition-all ${sel ? "bg-[#0B213F]" : "bg-slate-200"}`}>
                        {sel && <Check size={8} className="text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <AdminInput label="Deskripsi" required value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Deskripsi singkat mapel..." />
          </form>
        </AdminModal>
      )}

      {/* Delete confirm */}
      <PremiumModal
        isOpen={delModal.open}
        onClose={() => setDelModal({ open: false, id: "", title: "" })}
        onConfirm={handleDelete}
        title="Hapus Mapel"
        message={`Hapus "${delModal.title}"? Tindakan ini tidak dapat dibatalkan.`}
        type="delete"
        loading={deleting}
      />
    </AdminPageLayout>
  );
}
