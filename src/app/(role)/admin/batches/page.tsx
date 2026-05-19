"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit3, Trash2, Calendar, Users } from "lucide-react";
import { PremiumModal, Toast } from "@/shared/components/ui/PremiumFeedback";
import AdminPageLayout, {
  AdminCard, AdminButton, AdminModal,
  AdminInput, AdminTextarea, AdminSearch, StatusBadge,
} from "@/features/users/components/layouts/AdminPageLayout";

// ── Types ────────────────────────────────────────────────────────────────────
interface Batch {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  maxStudents: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { enrollments: number; packages: number };
}

const EMPTY_FORM = { id: "", name: "", description: "", startDate: "", endDate: "", maxStudents: 50, isActive: true };

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AdminBatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  // Delete state
  const [delModal, setDelModal] = useState({ open: false, id: "", name: "" });
  const [deleting, setDeleting] = useState(false);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/batches", { credentials: "include" });
      if (res.ok) { const d = await res.json(); setBatches(d.batches || []); }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—";

  // ── Open modals ───────────────────────────────────────────────────────────
  const openCreate = () => { setIsEditing(false); setForm({ ...EMPTY_FORM }); setShowModal(true); };
  const openEdit = (b: Batch) => {
    setIsEditing(true);
    setForm({
      id: b.id, name: b.name, description: b.description ?? "",
      startDate: b.startDate ? new Date(b.startDate).toISOString().split("T")[0] : "",
      endDate: b.endDate ? new Date(b.endDate).toISOString().split("T")[0] : "",
      maxStudents: b.maxStudents, isActive: b.isActive,
    });
    setShowModal(true);
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isEditing ? `/api/batches/${form.id}` : "/api/batches";
      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, description: form.description, startDate: form.startDate || undefined, endDate: form.endDate || undefined, maxStudents: Number(form.maxStudents), isActive: form.isActive }),
      });
      if (res.ok) { showToast(isEditing ? "Batch diperbarui" : "Batch berhasil dibuat"); setShowModal(false); load(); }
      else { const err = await res.json().catch(() => ({})); showToast(err.message ?? "Gagal menyimpan", "error"); }
    } finally { setSaving(false); }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/batches/${delModal.id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) { showToast("Batch dihapus"); setDelModal({ open: false, id: "", name: "" }); load(); }
      else { const err = await res.json().catch(() => ({})); showToast(err.message ?? "Gagal menghapus", "error"); }
    } finally { setDeleting(false); }
  };

  const visible = batches.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AdminPageLayout
      title="Kelola Angkatan"
      subtitle="Atur angkatan (batch) belajar, kuota siswa, dan periode aktif."
      action={
        <AdminButton onClick={openCreate}>
          <Plus size={14} /> Buat Angkatan
        </AdminButton>
      }
    >
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="w-64">
          <AdminSearch value={search} onChange={setSearch} placeholder="Cari angkatan..." />
        </div>
        <p className="text-[11px] text-slate-400 font-medium">{visible.length} angkatan ditemukan</p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => <div key={i} className="h-44 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
      ) : visible.length === 0 ? (
        <AdminCard className="p-10 text-center text-sm text-slate-300">
          Belum ada angkatan — klik "Buat Angkatan"
        </AdminCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map(b => {
            const enrolls = b._count?.enrollments ?? 0;
            const isFull = b.maxStudents > 0 && enrolls >= b.maxStudents;
            return (
              <AdminCard key={b.id} className="flex flex-col">
                <div className="p-5 flex-1 space-y-3">
                  {/* Status row */}
                  <div className="flex items-center justify-between">
                    <StatusBadge active={b.isActive} />
                    {isFull && (
                      <span className="text-[10px] font-semibold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                        Kuota Penuh
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <div>
                    <h3 className="font-semibold text-slate-800 leading-snug">{b.name}</h3>
                    {b.description && <p className="mt-0.5 text-[12px] text-slate-400 line-clamp-2">{b.description}</p>}
                  </div>

                  {/* Meta */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-50">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="flex items-center gap-1.5 text-slate-400"><Calendar size={12} /> Periode</span>
                      <span className="font-medium text-slate-700">{fmt(b.startDate)} — {fmt(b.endDate)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="flex items-center gap-1.5 text-slate-400"><Users size={12} /> Siswa</span>
                      <span className={`font-medium ${isFull ? "text-rose-500" : "text-slate-700"}`}>
                        {enrolls} / {b.maxStudents}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex border-t border-slate-100">
                  <button onClick={() => openEdit(b)} className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[12px] font-medium text-slate-500 hover:text-[#0B213F] hover:bg-slate-50 transition-colors">
                    <Edit3 size={13} /> Edit
                  </button>
                  <div className="w-px bg-slate-100" />
                  <button onClick={() => setDelModal({ open: true, id: b.id, name: b.name })} className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[12px] font-medium text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors">
                    <Trash2 size={13} /> Hapus
                  </button>
                </div>
              </AdminCard>
            );
          })}
        </div>
      )}

      {/* ── Form Modal ── */}
      {showModal && (
        <AdminModal
          title={isEditing ? "Edit Angkatan" : "Buat Angkatan Baru"}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <AdminButton variant="secondary" onClick={() => setShowModal(false)}>Batal</AdminButton>
              <AdminButton form="batchForm" type="submit" loading={saving}>
                {isEditing ? "Simpan Perubahan" : "Buat Angkatan"}
              </AdminButton>
            </>
          }
        >
          <form id="batchForm" onSubmit={handleSave} className="space-y-4">
            <AdminInput label="Nama Angkatan" required value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Contoh: Angkatan 1 — 2026" />
            <AdminTextarea label="Deskripsi" value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Keterangan singkat angkatan ini..." />
            <div className="grid grid-cols-2 gap-3">
              <AdminInput label="Tanggal Mulai" type="date" value={form.startDate}
                onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
              <AdminInput label="Tanggal Selesai" type="date" value={form.endDate}
                onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <AdminInput label="Maks. Siswa" required type="number" min="1" value={form.maxStudents}
                onChange={e => setForm(p => ({ ...p, maxStudents: Number(e.target.value) }))} />
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-slate-400">Status</label>
                <button type="button" onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
                  className={`w-full rounded-lg border py-2.5 text-sm font-semibold transition-all ${form.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
                  {form.isActive ? "✓ Aktif" : "Nonaktif"}
                </button>
              </div>
            </div>
          </form>
        </AdminModal>
      )}

      {/* ── Delete Confirm ── */}
      <PremiumModal
        isOpen={delModal.open}
        onClose={() => setDelModal({ open: false, id: "", name: "" })}
        onConfirm={handleDelete}
        title="Hapus Angkatan"
        message={`Angkatan "${delModal.name}" akan dihapus permanen beserta semua data terkait.`}
        type="delete"
        confirmText="Hapus"
        loading={deleting}
      />
    </AdminPageLayout>
  );
}
