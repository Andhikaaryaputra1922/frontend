"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { PremiumModal, Toast } from "@/shared/components/ui/PremiumFeedback";
import AdminPageLayout, {
  AdminButton, AdminModal, AdminTable,
  AdminInput, AdminSelect, AdminSearch, RoleBadge,
} from "@/features/users/components/layouts/AdminPageLayout";

// ── Types ────────────────────────────────────────────────────────────────────
interface ActivePackage {
  name: string; price: number; startedAt: string;
  expiresAt: string | null; isExpired: boolean | null; daysRemaining: number | null;
}
interface User {
  id: string; name: string | null; email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
  phone: string | null; school: string | null; address: string | null;
  dateOfBirth: string | null; gender: string | null; bio: string | null;
  image: string | null; profileCompleted: boolean; createdAt: string;
  _count: { enrollments: number; coursesTaught: number };
  activePackage: ActivePackage | null;
  coursesList?: string[];
  transactions?: { id: string; amount: string | number; updatedAt: string; provider: string | null }[];
}

const ROLE_TABS = [
  { key: "ALL", label: "Semua" },
  { key: "STUDENT", label: "Siswa" },
  { key: "TEACHER", label: "Pengajar" },
  { key: "ADMIN", label: "Admin" },
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editUserId, setEditUserId] = useState("");
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<"ADMIN" | "TEACHER" | "STUDENT" | "PARENT">("STUDENT");
  const [formPhone, setFormPhone] = useState("");
  const [formSchool, setFormSchool] = useState("");

  // Delete state
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; user: User | null }>({ isOpen: false, user: null });
  const [deleting, setDeleting] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL("/api/admin/users", window.location.origin);
      if (activeTab !== "ALL") url.searchParams.set("role", activeTab);
      if (search) url.searchParams.set("search", search);
      const res = await fetch(url.toString(), { credentials: "include" });
      if (res.ok) { const d = await res.json().catch(() => ({})); setUsers(d.users ?? []); }
    } finally { setLoading(false); }
  }, [activeTab, search]);

  useEffect(() => { const t = setTimeout(fetchUsers, 300); return () => clearTimeout(t); }, [fetchUsers]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fmt = (d: string | null) => d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—";

  const openCreate = () => {
    setIsEditing(false); setEditUserId("");
    setFormName(""); setFormEmail(""); setFormPassword("");
    setFormRole("STUDENT"); setFormPhone(""); setFormSchool("");
    setShowModal(true);
  };
  const openEdit = (u: User) => {
    setIsEditing(true); setEditUserId(u.id);
    setFormName(u.name || ""); setFormEmail(u.email); setFormPassword("");
    setFormRole(u.role); setFormPhone(u.phone || ""); setFormSchool(u.school || "");
    setShowModal(true);
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch(isEditing ? `/api/admin/users/${editUserId}` : "/api/admin/users", {
        method: isEditing ? "PUT" : "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formName, email: formEmail, role: formRole, phone: formPhone || undefined, school: formSchool || undefined, ...(formPassword ? { password: formPassword } : {}) }),
      });
      if (res.ok) {
        setShowModal(false); fetchUsers();
        setToast({ message: `User berhasil ${isEditing ? "diperbarui" : "ditambahkan"}!`, type: "success" });
      } else {
        const err = await res.json().catch(() => ({}));
        setToast({ message: err.message || "Gagal menyimpan", type: "error" });
      }
    } catch { setToast({ message: "Error jaringan", type: "error" }); }
    finally { setSaving(false); }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteModal.user || deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteModal.user.id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) { fetchUsers(); setToast({ message: "User berhasil dihapus", type: "success" }); }
      else { const err = await res.json().catch(() => ({})); setToast({ message: err.message || "Gagal menghapus", type: "error" }); }
    } catch { setToast({ message: "Error jaringan", type: "error" }); }
    finally { setDeleting(false); setDeleteModal({ isOpen: false, user: null }); }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AdminPageLayout
      title="Manajemen User"
      subtitle="Kelola data akun siswa, pengajar, dan admin platform."
      action={<AdminButton onClick={openCreate}><Plus size={14} /> Tambah User</AdminButton>}
    >
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
        {/* Role tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
          {ROLE_TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-1.5 rounded-md text-[12px] font-semibold transition-all ${activeTab === t.key ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="w-60">
          <AdminSearch value={search} onChange={setSearch} placeholder="Cari nama/email..." />
        </div>
      </div>

      {/* Table */}
      <AdminTable
        headers={["User", "Role", "Kontak", "Paket Aktif", "Aktivitas", "Aksi"]}
        loading={loading}
        empty={!loading && users.length === 0}
      >
        {users.map(u => (
          <React.Fragment key={u.id}>
            <tr className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setExpandedId(expandedId === u.id ? null : u.id)}>
              {/* User */}
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0B213F] text-[11px] font-bold text-white">
                    {(u.name || u.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-slate-800">{u.name || "Tanpa Nama"}</p>
                    <p className="text-[11px] text-slate-400">{u.email}</p>
                  </div>
                </div>
              </td>
              {/* Role */}
              <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
              {/* Contact */}
              <td className="px-5 py-4">
                <p className="text-[12px] text-slate-700">{u.phone || "—"}</p>
                <p className="text-[11px] text-slate-400">{u.school || "Umum"}</p>
              </td>
              {/* Package */}
              <td className="px-5 py-4">
                {u.activePackage ? (
                  <>
                    <p className="text-[12px] font-semibold text-slate-700">{u.activePackage.name}</p>
                    <p className={`text-[11px] font-medium ${u.activePackage.isExpired ? "text-rose-500" : u.activePackage.daysRemaining !== null && u.activePackage.daysRemaining <= 7 ? "text-amber-500" : "text-emerald-600"}`}>
                      {u.activePackage.isExpired ? "Kedaluwarsa" : u.activePackage.expiresAt ? `${u.activePackage.daysRemaining} hari lagi` : "Unlimited"}
                    </p>
                  </>
                ) : <span className="text-[12px] text-slate-300">—</span>}
              </td>
              {/* Activity */}
              <td className="px-5 py-4">
                {u.role === "STUDENT" && <span className="text-[12px] font-medium text-emerald-600">{u._count.enrollments} enrollment</span>}
                {u.role === "TEACHER" && <span className="text-[12px] font-medium text-amber-600">{u._count.coursesTaught} kursus</span>}
              </td>
              {/* Actions */}
              <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(u)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-all">Edit</button>
                  <button onClick={() => setDeleteModal({ isOpen: true, user: u })} className="rounded-lg border border-rose-100 px-3 py-1.5 text-[11px] font-semibold text-rose-400 hover:bg-rose-50 transition-all">Hapus</button>
                  {expandedId === u.id ? <ChevronUp size={14} className="text-slate-300" /> : <ChevronDown size={14} className="text-slate-300" />}
                </div>
              </td>
            </tr>

            {/* Expanded row */}
            {expandedId === u.id && (
              <tr key={`${u.id}-detail`} className="bg-slate-50/50">
                <td colSpan={6} className="px-5 py-4">
                  <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[12px]">
                      {[
                        { label: "Alamat", value: u.address || "—" },
                        { label: "Tgl. Lahir", value: fmt(u.dateOfBirth) },
                        { label: "Gender", value: u.gender || "—" },
                        { label: "Bergabung", value: fmt(u.createdAt) },
                        { label: "Profil Lengkap", value: u.profileCompleted ? "Ya" : "Belum" },
                        { label: "Bio", value: u.bio || "—" },
                      ].map(d => (
                        <div key={d.label}>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">{d.label}</p>
                          <p className="font-medium text-slate-700">{d.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Pembelian & Paket Detail */}
                    {u.role === "STUDENT" && (u.coursesList?.length || u.transactions?.length || u.activePackage) ? (
                      <div className="border-t border-slate-200 pt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Akses & Status</p>
                          {u.activePackage ? (
                            <div className="text-[12px] space-y-1">
                              <p><span className="text-slate-500">Paket:</span> <span className="font-medium text-slate-800">{u.activePackage.name}</span></p>
                              <p><span className="text-slate-500">Mulai Akses:</span> <span className="font-medium text-slate-800">{fmt(u.activePackage.startedAt)}</span></p>
                              <p><span className="text-slate-500">Berakhir:</span> <span className={`font-medium ${u.activePackage.isExpired ? "text-rose-500" : "text-slate-800"}`}>{u.activePackage.expiresAt ? fmt(u.activePackage.expiresAt) : "Selamanya"}</span></p>
                            </div>
                          ) : (
                            <p className="text-[12px] text-slate-400 italic">Belum ada paket aktif</p>
                          )}
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Riwayat Pembayaran</p>
                          {u.transactions && u.transactions.length > 0 ? (
                            <div className="space-y-2">
                              {u.transactions.map((tx) => (
                                <div key={tx.id} className="text-[12px]">
                                  <p className="font-medium text-emerald-600">Lunas (Di-approve: {fmt(tx.updatedAt)})</p>
                                  <p className="text-slate-500">Nominal: Rp {Number(tx.amount).toLocaleString('id-ID')} {tx.provider ? `(${tx.provider})` : ""}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[12px] text-slate-400 italic">Belum ada riwayat</p>
                          )}
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Mata Pelajaran (Enrollment)</p>
                          {u.coursesList && u.coursesList.length > 0 ? (
                            <ul className="list-disc list-inside text-[12px] text-slate-700 space-y-0.5">
                              {u.coursesList.map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-[12px] text-slate-400 italic">Belum mendaftar mapel</p>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </AdminTable>

      {/* ── Form Modal ── */}
      {showModal && (
        <AdminModal
          title={isEditing ? "Edit User" : "Tambah User"}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <AdminButton variant="secondary" onClick={() => setShowModal(false)}>Batal</AdminButton>
              <AdminButton form="userForm" type="submit" loading={saving}>{isEditing ? "Simpan" : "Tambah"}</AdminButton>
            </>
          }
        >
          <form id="userForm" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <AdminInput label="Nama" required value={formName} onChange={e => setFormName(e.target.value)} />
              <AdminSelect label="Role" value={formRole} onChange={e => setFormRole(e.target.value as any)}>
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="ADMIN">Admin</option>
                <option value="PARENT">Parent</option>
              </AdminSelect>
            </div>
            <AdminInput label="Email" required type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} />
            <AdminInput label={`Password${isEditing ? " (kosongkan jika tidak diubah)" : ""}`} required={!isEditing} type="password" value={formPassword} onChange={e => setFormPassword(e.target.value)} minLength={6} />
            <div className="grid grid-cols-2 gap-3">
              <AdminInput label="Telepon" value={formPhone} onChange={e => setFormPhone(e.target.value)} />
              <AdminInput label="Sekolah" value={formSchool} onChange={e => setFormSchool(e.target.value)} />
            </div>
          </form>
        </AdminModal>
      )}

      {/* ── Delete Confirm ── */}
      <PremiumModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, user: null })}
        onConfirm={confirmDelete}
        title="Hapus User"
        message={`Yakin ingin menghapus ${deleteModal.user?.name}? User tidak dapat login lagi.`}
        type="delete"
        confirmText="Hapus"
        loading={deleting}
      />
    </AdminPageLayout>
  );
}
