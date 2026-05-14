"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PremiumModal, Toast } from "@/shared/components/ui/PremiumFeedback";

interface ActivePackage {
  name: string;
  price: number;
  startedAt: string;
  expiresAt: string | null;
  isExpired: boolean | null;
  daysRemaining: number | null;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
  phone: string | null;
  school: string | null;
  address: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  bio: string | null;
  image: string | null;
  profileCompleted: boolean;
  createdAt: string;
  _count: { enrollments: number; coursesTaught: number };
  activePackage: ActivePackage | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editUserId, setEditUserId] = useState("");
  const [saving, setSaving] = useState(false);

  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<"ADMIN"|"TEACHER"|"STUDENT"|"PARENT">("STUDENT");
  const [formPhone, setFormPhone] = useState("");
  const [formSchool, setFormSchool] = useState("");

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; user: User | null }>({ isOpen: false, user: null });
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const url = new URL("/api/admin/users", window.location.origin);
      if (activeTab !== "ALL") url.searchParams.set("role", activeTab);
      if (search) url.searchParams.set("search", search);
      const res = await fetch(url.toString(), { credentials: "include" });
      if (res.ok) { const d = await res.json(); setUsers(d.users ?? []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [activeTab, search]);

  useEffect(() => { const t = setTimeout(fetchUsers, 300); return () => clearTimeout(t); }, [fetchUsers]);

  const openCreateModal = () => {
    setIsEditing(false); setEditUserId("");
    setFormName(""); setFormEmail(""); setFormPassword("");
    setFormRole("STUDENT"); setFormPhone(""); setFormSchool("");
    setShowModal(true);
  };

  const openEditModal = (u: User) => {
    setIsEditing(true); setEditUserId(u.id);
    setFormName(u.name || ""); setFormEmail(u.email); setFormPassword("");
    setFormRole(u.role); setFormPhone(u.phone || ""); setFormSchool(u.school || "");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const url = isEditing ? `/api/admin/users/${editUserId}` : `/api/admin/users`;
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method, credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName, email: formEmail, role: formRole,
          phone: formPhone || undefined, school: formSchool || undefined,
          ...(formPassword ? { password: formPassword } : {}),
        }),
      });
      if (res.ok) { 
        setShowModal(false); 
        fetchUsers(); 
        setToast({ message: `User berhasil ${isEditing ? "diperbarui" : "ditambahkan"}!`, type: "success" });
      }
      else { 
        const err = await res.json(); 
        setToast({ message: err.message || "Gagal menyimpan", type: "error" });
      }
    } catch { 
      setToast({ message: "Error jaringan", type: "error" }); 
    }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!deleteModal.user || deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteModal.user.id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        fetchUsers();
        setToast({ message: "User berhasil dihapus", type: "success" });
      }
      else { 
        const err = await res.json(); 
        setToast({ message: err.message || "Gagal menghapus", type: "error" });
      }
    } catch { 
      setToast({ message: "Error jaringan", type: "error" }); 
    } finally {
      setDeleting(false);
      setDeleteModal({ isOpen: false, user: null });
    }
  };

  const tabs = [
    { key: "ALL", label: "Semua" },
    { key: "STUDENT", label: "Siswa" },
    { key: "TEACHER", label: "Pengajar" },
    { key: "ADMIN", label: "Admin" },
  ];

  const roleBadge = (role: string) => {
    const m: Record<string, string> = {
      ADMIN: "bg-[#8B0000]/10 text-[#8B0000]",
      TEACHER: "bg-amber-100 text-amber-800",
      STUDENT: "bg-emerald-100 text-emerald-800",
      PARENT: "bg-blue-100 text-blue-800",
    };
    return m[role] ?? "bg-slate-100 text-slate-600";
  };

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-";

  return (
    <>
      <main className="min-h-screen bg-[var(--base)] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-7 md:p-10 shadow-sm">

          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <Link href="/admin" className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                Admin Panel
              </Link>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">Manajemen User</h1>
              <p className="mt-1 text-sm text-slate-500">Kelola data akun siswa, pengajar, dan admin platform.</p>
            </div>
            <button onClick={openCreateModal} className="inline-flex items-center gap-2 rounded-xl bg-[#8B0000] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#8B0000]/20 hover:bg-[#6B0000] transition-all">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Tambah User
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between mb-6">
            <div className="flex flex-wrap gap-2">
              {tabs.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors border ${
                    activeTab === t.key
                      ? "bg-[#8B0000] text-white border-transparent"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}>{t.label}</button>
              ))}
            </div>
            <div className="w-full sm:w-64 relative">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama/email..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] focus:bg-white" />
              <svg className="absolute left-3 top-2.5 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Kontak</th>
                  <th className="px-5 py-3">Paket Aktif</th>
                  <th className="px-5 py-3">Aktivitas</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">Memuat...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">Tidak ada data ditemukan</td></tr>
                ) : users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => setExpandedId(expandedId === u.id ? null : u.id)}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#8B0000] text-xs font-bold text-white">
                          {(u.name || u.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{u.name || "Tanpa Nama"}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold ${roleBadge(u.role)}`}>{u.role}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-slate-700">{u.phone || "-"}</p>
                      <p className="text-[11px] text-slate-400">{u.school || "Umum"}</p>
                    </td>
                    <td className="px-5 py-4">
                      {u.activePackage ? (
                        <div>
                          <p className="text-xs font-bold text-slate-700">{u.activePackage.name}</p>
                          {u.activePackage.expiresAt ? (
                            <p className={`text-[11px] font-semibold ${u.activePackage.isExpired ? "text-red-600" : (u.activePackage.daysRemaining !== null && u.activePackage.daysRemaining <= 7) ? "text-amber-600" : "text-emerald-600"}`}>
                              {u.activePackage.isExpired ? "Kedaluwarsa" : `${u.activePackage.daysRemaining} hari lagi`}
                            </p>
                          ) : (
                            <p className="text-[11px] text-emerald-600 font-semibold">Unlimited</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">–</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {u.role === "STUDENT" && <span className="text-xs font-semibold text-emerald-600">{u._count.enrollments} Enrollments</span>}
                      {u.role === "TEACHER" && <span className="text-xs font-semibold text-[#8B0000]">{u._count.coursesTaught} Courses</span>}
                    </td>
                    <td className="px-5 py-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(u)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-[#8B0000] hover:text-white hover:border-transparent transition-colors">Edit</button>
                        <button onClick={() => setDeleteModal({ isOpen: true, user: u })} className="rounded-lg border border-red-200 px-3 py-1.5 text-[11px] font-bold text-red-500 hover:bg-red-50 transition-colors">Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Expanded Detail Panel */}
          {expandedId && (() => {
            const u = users.find(u => u.id === expandedId);
            if (!u) return null;
            return (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-6 animate-in fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-slate-800">Detail: {u.name || u.email}</h3>
                  <button onClick={() => setExpandedId(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Tutup</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  {[
                    { label: "Email", value: u.email },
                    { label: "Telepon", value: u.phone || "-" },
                    { label: "Sekolah", value: u.school || "-" },
                    { label: "Alamat", value: u.address || "-" },
                    { label: "Tanggal Lahir", value: formatDate(u.dateOfBirth) },
                    { label: "Gender", value: u.gender || "-" },
                    { label: "Profil Lengkap", value: u.profileCompleted ? "Ya" : "Belum" },
                    { label: "Bergabung", value: formatDate(u.createdAt) },
                  ].map(d => (
                    <div key={d.label}>
                      <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mb-1">{d.label}</p>
                      <p className="font-semibold text-slate-800">{d.value}</p>
                    </div>
                  ))}
                </div>
                {u.bio && <div className="mt-4"><p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Bio</p><p className="text-xs text-slate-700">{u.bio}</p></div>}
                {u.activePackage && (
                  <div className="mt-4 rounded-lg bg-white border border-slate-200 p-4">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Paket Aktif</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div><p className="text-[10px] text-slate-400">Nama</p><p className="font-bold text-slate-800">{u.activePackage.name}</p></div>
                      <div><p className="text-[10px] text-slate-400">Mulai</p><p className="font-semibold text-slate-800">{formatDate(u.activePackage.startedAt)}</p></div>
                      <div><p className="text-[10px] text-slate-400">Berakhir</p><p className="font-semibold text-slate-800">{u.activePackage.expiresAt ? formatDate(u.activePackage.expiresAt) : "Unlimited"}</p></div>
                      <div><p className="text-[10px] text-slate-400">Status</p>
                        <p className={`font-bold ${u.activePackage.isExpired ? "text-red-600" : "text-emerald-600"}`}>
                          {u.activePackage.isExpired ? "Kedaluwarsa" : u.activePackage.daysRemaining !== null ? `${u.activePackage.daysRemaining} hari tersisa` : "Aktif (Unlimited)"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-7 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900">{isEditing ? "Edit User" : "Tambah User"}</h2>
              <button onClick={() => setShowModal(false)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama</label>
                  <input required value={formName} onChange={e => setFormName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] focus:bg-white focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Role</label>
                  <select value={formRole} onChange={e => setFormRole(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] focus:bg-white focus:outline-none">
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="ADMIN">Admin</option>
                    <option value="PARENT">Parent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email</label>
                <input required type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] focus:bg-white focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password {isEditing && "(Kosongkan jika tidak diubah)"}</label>
                <input required={!isEditing} type="password" value={formPassword} onChange={e => setFormPassword(e.target.value)} minLength={6}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] focus:bg-white focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Telepon</label>
                  <input value={formPhone} onChange={e => setFormPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] focus:bg-white focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sekolah</label>
                  <input value={formSchool} onChange={e => setFormSchool(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] focus:bg-white focus:outline-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-[#8B0000] px-4 py-3 text-sm font-bold text-white shadow-md shadow-[#8B0000]/20 disabled:opacity-50 transition-all">
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
    {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    <PremiumModal
      isOpen={deleteModal.isOpen}
      onClose={() => setDeleteModal({ isOpen: false, user: null })}
      onConfirm={confirmDelete}
      title="Hapus User"
      message={`Yakin ingin menghapus user ${deleteModal.user?.name}? User ini tidak akan bisa login lagi.`}
      type="delete"
      confirmText="Hapus"
      loading={deleting}
    />
  </>
  );
}
