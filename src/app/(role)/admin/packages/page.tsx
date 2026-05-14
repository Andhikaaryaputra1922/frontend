"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PremiumModal, Toast } from "@/shared/components/ui/PremiumFeedback";
import { useRouter } from "next/navigation";

/* ── Types ──────────────────────────────────────────── */
interface PackageCourse {
  courseId: string;
  lessonLimit: number | null;
  course: { id: string; title: string };
}

interface Package {
  id: string;
  name: string;
  description: string | null;
  price: number;
  defaultLessonLimit: number;
  isActive: boolean;
  createdAt: string;
  packageCourses: PackageCourse[];
}

/* ── Icons ──────────────────────────────────────────── */
const IC = {
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  ),
  Back: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
  ),
  Package: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  ),
  Pause: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
  ),
  Book: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
  ),
  Dollar: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
  ),
  Calendar: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  ),
  Image: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
  ),
  X: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  ),
  Arrow: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
  ),
};

export default function AdminPackagesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formLimit, setFormLimit] = useState("");
  const [formImage, setFormImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchPackages = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/packages", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      const mapped = (data.packages ?? []).map((p: any) => ({
        ...p,
        price: Number(p.price)
      }));
      setPackages(mapped);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPackages(); }, [fetchPackages]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creating) return;
    setCreating(true);
    try {
      // If we have an image, upload it first
      let imageUrl: string | undefined;
      if (formImage) {
        const fd = new FormData();
        fd.append("file", formImage);
        const uploadRes = await fetch("/api/uploads", { method: "POST", credentials: "include", body: fd });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.url;
        }
      }

      const res = await fetch("/api/admin/packages", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          description: formDesc.trim() || undefined,
          price: Number(formPrice) || 0,
          defaultLessonLimit: Number(formLimit) || 0,
          imageUrl,
        }),
      });
      if (res.ok) {
        setFormName(""); setFormDesc(""); setFormPrice(""); setFormLimit("");
        setFormImage(null); setImagePreview(null);
        setShowCreate(false);
        fetchPackages();
        setToast({ message: "Paket berhasil dibuat!", type: "success" });
      } else {
        const err = await res.json();
        setToast({ message: err.message || "Gagal membuat paket", type: "error" });
      }
    } catch { 
      setToast({ message: "Terjadi kesalahan jaringan", type: "error" }); 
    }
    finally { setCreating(false); }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--base)] px-6 py-10">
        <div className="mx-auto max-w-5xl flex items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#8B0000] border-t-transparent" />
          <p className="text-sm text-slate-500">Memuat data paket…</p>
        </div>
      </main>
    );
  }

  const totalActive = packages.filter(p => p.isActive).length;
  const totalInactive = packages.filter(p => !p.isActive).length;
  const totalCourses = new Set(packages.flatMap(p => p.packageCourses.map(pc => pc.courseId))).size;

  return (
    <>
      <main className="min-h-screen bg-[var(--base)] px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-7 md:p-10 shadow-sm">

          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link href="/admin" className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors">
                <IC.Back /> Admin Panel
              </Link>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">Manajemen Paket</h1>
              <p className="mt-1 text-sm text-slate-500">Kelola paket belajar siswa.</p>
            </div>
            <button onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#8B0000] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#8B0000]/20 transition-all hover:bg-[#6B0000] hover:shadow-lg hover:-translate-y-0.5">
              <IC.Plus /> Buat Paket Baru
            </button>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total Paket", value: packages.length, icon: <IC.Package />, color: "text-[#8B0000]", bg: "bg-red-50" },
              { label: "Paket Aktif", value: totalActive, icon: <IC.Check />, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Nonaktif", value: totalInactive, icon: <IC.Pause />, color: "text-slate-500", bg: "bg-slate-100" },
              { label: "Total Course", value: totalCourses, icon: <IC.Book />, color: "text-violet-600", bg: "bg-violet-50" },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl border border-slate-200 ${s.bg} p-4`}>
                <div className={`${s.color} mb-2`}>{s.icon}</div>
                <p className="text-2xl font-black text-slate-800">{s.value}</p>
                <p className="text-[11px] text-slate-500 font-semibold">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Package Cards */}
          {packages.length === 0 ? (
            <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-16">
              <div className="text-slate-300 mb-4"><IC.Package /></div>
              <p className="text-lg font-bold text-slate-700">Belum ada paket</p>
              <p className="mt-1 text-sm text-slate-500">Buat paket pertama untuk mulai mengatur siswa</p>
              <button onClick={() => setShowCreate(true)}
                className="mt-6 rounded-xl bg-[#8B0000] px-6 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5">
                Buat Paket
              </button>
            </div>
          ) : (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {packages.map((pkg) => (
                <button key={pkg.id} onClick={() => router.push(`/admin/packages/${pkg.id}`)}
                  className="group relative rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-[#8B0000]/30">

                  <div className="absolute right-4 top-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                      pkg.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${pkg.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                      {pkg.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>

                  <p className="text-base font-black text-slate-900 pr-24">{pkg.name}</p>
                  {pkg.description && <p className="mt-1 text-sm text-slate-500 line-clamp-2">{pkg.description}</p>}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                      <IC.Dollar /> {formatPrice(Number(pkg.price))}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                      <IC.Calendar /> {pkg.defaultLessonLimit <= 0 ? "Unlimited" : `${pkg.defaultLessonLimit} pertemuan`}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                      <IC.Book /> {pkg.packageCourses.length} course
                    </span>
                  </div>

                  {pkg.packageCourses.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {pkg.packageCourses.slice(0, 3).map((pc) => (
                        <span key={pc.courseId} className="rounded-md bg-[#8B0000]/10 px-2 py-0.5 text-[10px] font-bold text-[#8B0000]">{pc.course.title}</span>
                      ))}
                      {pkg.packageCourses.length > 3 && (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">+{pkg.packageCourses.length - 3} lagi</span>
                      )}
                    </div>
                  )}

                  <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500 transition-colors group-hover:bg-[#8B0000] group-hover:text-white group-hover:border-transparent">
                    Kelola Paket <IC.Arrow />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Create Modal ─────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-7 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900">Buat Paket Baru</h2>
              <button onClick={() => setShowCreate(false)} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                <IC.X />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Paket *</label>
                <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Misal: Paket 10 Pertemuan" required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] focus:bg-white" />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wider">Deskripsi</label>
                <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} placeholder="Keterangan singkat tentang paket ini" rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] focus:bg-white resize-none" />
              </div>

              {/* Image Upload */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wider">Gambar Paket</label>
                <div className="relative group">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center transition-all group-hover:border-[#8B0000] group-hover:bg-red-50/30">
                    {imagePreview ? (
                      <div className="flex flex-col items-center">
                        <img src={imagePreview} alt="Preview" className="h-24 w-auto rounded-lg object-cover shadow-sm mb-2" />
                        <p className="text-xs font-semibold text-slate-600">{formImage?.name}</p>
                        <p className="text-[10px] text-slate-400 mt-1">Klik untuk mengganti</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-slate-400">
                        <IC.Image />
                        <p className="mt-2 text-xs font-semibold text-slate-500">Klik atau seret gambar ke sini</p>
                        <p className="text-[10px] text-slate-400 mt-1">PNG, JPG (Max. 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wider">Harga (Rp)</label>
                  <input type="number" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} placeholder="100000" min="0"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] focus:bg-white" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-500 uppercase tracking-wider">Jumlah Pertemuan</label>
                  <input type="number" value={formLimit} onChange={(e) => setFormLimit(e.target.value)} placeholder="10" min="0"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] focus:bg-white" />
                  <p className="mt-1 text-[10px] text-slate-400">0 = unlimited</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={creating || !formName.trim()}
                  className="flex-1 rounded-xl bg-[#8B0000] px-4 py-3 text-sm font-bold text-white shadow-md shadow-[#8B0000]/20 transition-all hover:bg-[#6B0000] disabled:opacity-50 disabled:cursor-not-allowed">
                  {creating ? "Menyimpan…" : "Buat Paket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
    {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
  </>
  );
}
