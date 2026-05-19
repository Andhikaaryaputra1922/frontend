"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Calendar, Clock, Link2, Edit3, Trash2, ExternalLink } from "lucide-react";
import { PremiumModal, Toast } from "@/shared/components/ui/PremiumFeedback";
import AdminPageLayout, {
  AdminButton, AdminModal, AdminTable,
  AdminInput, AdminSelect, AdminSearch, StatusBadge,
} from "@/features/users/components/layouts/AdminPageLayout";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Schedule {
  id: string; courseId: string; date: string;
  startTime: string; endTime: string; meetingLink: string | null;
  course: { title: string; teacher: { id: string; name: string } | null };
}
interface Teacher { id: string; name: string; email: string }
interface Course { id: string; title: string; teachers?: { id: string; name: string }[] }

const EMPTY_FORM = {
  id: "", courseId: "",
  date: new Date().toISOString().split("T")[0],
  startTime: "08:00", endTime: "09:00", meetingLink: "",
};

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminSchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: "", title: "" });
  const [deleting, setDeleting] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [schRes, crsRes, tchrRes] = await Promise.all([
        fetch("/api/admin/schedules", { credentials: "include" }),
        fetch("/api/courses", { credentials: "include" }),
        fetch("/api/admin/users?role=TEACHER", { credentials: "include" }),
      ]);
      if (schRes.ok) setSchedules((await schRes.json().catch(() => ({}))).schedules || []);
      if (crsRes.ok) setAllCourses((await crsRes.json().catch(() => ({}))).courses || []);
      if (tchrRes.ok) setTeachers((await tchrRes.json().catch(() => ({}))).users || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const isExpired = (date: string, endTime: string) => {
    const end = new Date(date);
    const [h, m] = endTime.split(":").map(Number);
    end.setHours(h, m);
    return new Date() > end;
  };

  // ── Save / Delete ─────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseId) return showToast("Pilih kursus terlebih dahulu", "error");
    setSaving(true);
    try {
      const res = await fetch(isEditing ? `/api/admin/schedules/${formData.id}` : "/api/admin/schedules", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) { showToast(isEditing ? "Jadwal diperbarui" : "Jadwal dibuat"); setShowModal(false); fetchData(); }
      else showToast("Gagal menyimpan jadwal", "error");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/schedules/${deleteModal.id}`, { method: "DELETE" });
      if (res.ok) { showToast("Jadwal dihapus"); setDeleteModal({ isOpen: false, id: "", title: "" }); fetchData(); }
      else showToast("Gagal menghapus", "error");
    } finally { setDeleting(false); }
  };

  const openCreate = () => {
    setIsEditing(false); setSelectedTeacherId("");
    setFormData({ ...EMPTY_FORM }); setShowModal(true);
  };
  const openEdit = (s: Schedule) => {
    setIsEditing(true); setSelectedTeacherId(s.course.teacher?.id || "");
    setFormData({ ...s, date: s.date.split("T")[0], meetingLink: s.meetingLink || "" });
    setShowModal(true);
  };

  // ── Filtered ──────────────────────────────────────────────────────────────
  const filtered = schedules.filter(s =>
    s.course.title.toLowerCase().includes(search.toLowerCase()) ||
    s.course.teacher?.name?.toLowerCase().includes(search.toLowerCase())
  );
  const availableCourses = allCourses.filter(c => c.teachers?.some(t => t.id === selectedTeacherId));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AdminPageLayout
      title="Manajemen Jadwal"
      subtitle="Atur jadwal sesi belajar per mata kuliah."
      action={<AdminButton onClick={openCreate}><Plus size={14} /> Tambah Jadwal</AdminButton>}
    >
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Toolbar */}
      <div className="mb-5 w-64">
        <AdminSearch value={search} onChange={setSearch} placeholder="Cari kursus atau guru..." />
      </div>

      {/* Table */}
      <AdminTable
        headers={["Kursus / Guru", "Tanggal & Waktu", "Link", "Status", "Aksi"]}
        loading={loading}
        empty={!loading && filtered.length === 0}
      >
        {filtered.map(s => {
          const expired = isExpired(s.date, s.endTime);
          return (
            <tr key={s.id} className={`hover:bg-slate-50/50 transition-colors ${expired ? "opacity-60" : ""}`}>
              <td className="px-5 py-4">
                <p className="text-[13px] font-semibold text-slate-800">{s.course.title}</p>
                <p className="text-[11px] text-slate-400">{s.course.teacher?.name || "—"}</p>
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-1.5 text-[12px] text-slate-700">
                  <Calendar size={12} className="text-slate-400" />
                  {new Date(s.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                  <Clock size={11} />
                  {s.startTime} — {s.endTime}
                </div>
              </td>
              <td className="px-5 py-4">
                {s.meetingLink ? (
                  <a href={expired ? undefined : s.meetingLink} target="_blank" rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 text-[11px] font-medium rounded-full px-2.5 py-1 transition-all ${expired ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}>
                    <Link2 size={11} /> {expired ? "Kadaluarsa" : "Buka Link"}
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-300">—</span>
                )}
              </td>
              <td className="px-5 py-4">
                <StatusBadge active={!expired} activeLabel="Aktif" inactiveLabel="Selesai" />
              </td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(s)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-all"><Edit3 size={12} /></button>
                  <button onClick={() => setDeleteModal({ isOpen: true, id: s.id, title: s.course.title })} className="rounded-lg border border-rose-100 px-3 py-1.5 text-[11px] font-medium text-rose-400 hover:bg-rose-50 transition-all"><Trash2 size={12} /></button>
                </div>
              </td>
            </tr>
          );
        })}
      </AdminTable>

      {/* ── Form Modal ── */}
      {showModal && (
        <AdminModal
          title={isEditing ? "Edit Jadwal" : "Tambah Jadwal Baru"}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <AdminButton variant="secondary" onClick={() => setShowModal(false)}>Batal</AdminButton>
              <AdminButton form="scheduleForm" type="submit" loading={saving}>Simpan</AdminButton>
            </>
          }
        >
          <form id="scheduleForm" onSubmit={handleSave} className="space-y-4">
            <AdminSelect label="Guru" required value={selectedTeacherId} disabled={isEditing}
              onChange={e => { setSelectedTeacherId(e.target.value); setFormData(p => ({ ...p, courseId: "" })); }}>
              <option value="">-- Pilih Guru --</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.email})</option>)}
            </AdminSelect>

            <AdminSelect label="Kursus" required value={formData.courseId} disabled={isEditing || !selectedTeacherId}
              onChange={e => setFormData(p => ({ ...p, courseId: e.target.value }))}>
              <option value="">-- Pilih Kursus --</option>
              {availableCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </AdminSelect>

            <div className="grid grid-cols-2 gap-3">
              <AdminInput label="Tanggal" required type="date" value={formData.date}
                onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} />
              <AdminInput label="Link Meeting" type="url" value={formData.meetingLink}
                onChange={e => setFormData(p => ({ ...p, meetingLink: e.target.value }))}
                placeholder="https://zoom.us/j/..." />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <AdminInput label="Jam Mulai" required type="time" value={formData.startTime}
                onChange={e => setFormData(p => ({ ...p, startTime: e.target.value }))} />
              <AdminInput label="Jam Selesai" required type="time" value={formData.endTime}
                onChange={e => setFormData(p => ({ ...p, endTime: e.target.value }))} />
            </div>
          </form>
        </AdminModal>
      )}

      {/* Delete confirm */}
      <PremiumModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: "", title: "" })}
        onConfirm={handleDelete}
        title="Hapus Jadwal"
        message={`Yakin ingin menghapus jadwal untuk "${deleteModal.title}"?`}
        type="delete"
        loading={deleting}
      />
    </AdminPageLayout>
  );
}
