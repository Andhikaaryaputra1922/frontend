"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PremiumModal, Toast } from "@/shared/components/ui/PremiumFeedback";

interface Transaction {
  id: string;
  userId: string;
  packageId: string | null;
  courseId: string | null;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentMethod: string | null;
  proofUrl: string | null;
  notes: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
  package: { id: string; name: string } | null;
  course: { id: string; title: string } | null;
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const [viewingProof, setViewingProof] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; txId: string; status: "PAID" | "FAILED" }>({ isOpen: false, txId: "", status: "PAID" });

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const url = new URL("/api/admin/transactions", window.location.origin);
      if (activeTab !== "ALL") url.searchParams.set("status", activeTab);
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (res.ok) {
        const d = await res.json().catch(() => ({}));
        setTransactions(d.transactions ?? []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const updateStatus = async (txId: string, status: "PAID" | "FAILED", notes?: string) => {
    setUpdating(txId);
    try {
      const res = await fetch(`/api/admin/transactions/${txId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...(notes !== undefined && { notes }) }),
      });
      if (res.ok) {
        fetchTransactions();
        setToast({ message: status === "PAID" ? "Pembayaran disetujui! Akses materi diberikan." : "Pembayaran ditolak.", type: status === "PAID" ? "success" : "info" });
        setViewingProof(null);
      } else {
        const err = await res.json().catch(() => ({}));
        setToast({ message: err.message || "Gagal mengubah status", type: "error" });
      }
    } catch {
      setToast({ message: "Error jaringan", type: "error" });
    } finally {
      setUpdating(null);
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
  };

  const formatPrice = (p: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(p);

  const filteredTransactions = transactions.filter((t) => {
    if (search) {
      const q = search.toLowerCase();
      return (
        t.id.toLowerCase().includes(q) ||
        (t.user.name && t.user.name.toLowerCase().includes(q)) ||
        t.user.email.toLowerCase().includes(q) ||
        (t.package && t.package.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const tabs = [
    { key: "ALL", label: "Semua" },
    { key: "PENDING", label: "Menunggu" },
    { key: "PAID", label: "Berhasil" },
    { key: "FAILED", label: "Gagal" },
  ];

  return (
    <>
      <div className="p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="rounded-[40px] border border-[var(--border)] bg-white p-7 md:p-10 shadow-sm">
          
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-[var(--text)] md:text-4xl">
                Transaksi
              </h1>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Pantau pembayaran siswa dan berikan akses otomatis.
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between mb-6">
            <div className="flex flex-wrap gap-2">
              {tabs.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`rounded-full px-5 py-2 text-xs font-semibold transition-colors border ${activeTab === t.key ? "bg-[var(--primary)] text-[var(--primary-ink)] border-transparent" : "bg-[var(--base)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--border)]"}`}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="w-full sm:w-64 relative">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari TX ID, Siswa..."
                className="w-full rounded-full border border-[var(--border)] bg-[var(--base)] px-4 py-2 pl-10 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40" />
              <svg className="absolute left-3 top-2.5 text-[var(--muted)]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
            <table className="w-full text-left text-sm text-[var(--text)]">
              <thead className="bg-[var(--base)] text-xs font-semibold uppercase text-[var(--muted)] border-b border-[var(--border)]">
                <tr>
                  <th className="px-6 py-4">ID & Waktu</th>
                  <th className="px-6 py-4">Siswa</th>
                  <th className="px-6 py-4">Pembelian</th>
                  <th className="px-6 py-4">Status & Nominal</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] bg-[var(--surface)]">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-[var(--muted)]">Memuat...</td></tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-[var(--muted)]">Tidak ada transaksi ditemukan</td></tr>
                ) : (
                  filteredTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-[var(--base)] transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-mono text-xs font-bold uppercase text-[var(--muted)]">#{t.id.slice(-8)}</p>
                        <p className="text-[10px] text-[var(--muted)] mt-1">{new Date(t.createdAt).toLocaleString("id-ID")}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-sm">{t.user.name || "Tanpa Nama"}</p>
                        <p className="text-xs text-[var(--muted)]">{t.user.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        {t.package ? (
                          <div>
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">PAKET</span>
                            <p className="text-sm font-semibold mt-1">{t.package.name}</p>
                          </div>
                        ) : t.course ? (
                          <div>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">COURSE</span>
                            <p className="text-sm font-semibold mt-1">{t.course.title}</p>
                          </div>
                        ) : (
                          <span className="text-xs italic text-[var(--muted)]">Lainnya</span>
                        )}
                        <p className="text-[10px] text-[var(--muted)] mt-1">{t.paymentMethod || "Transfer Manual"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="mb-1">
                          <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                            t.status === "PAID" ? "bg-emerald-100 text-emerald-700" :
                            t.status === "FAILED" ? "bg-rose-100 text-rose-700" :
                            "bg-amber-100 text-amber-700"
                          }`}>
                            {t.status}
                          </span>
                        </div>
                        <p className="font-bold text-sm">{formatPrice(t.amount)}</p>
                        {t.notes && <p className="text-[10px] text-amber-600 mt-1">Note: {t.notes}</p>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          {t.proofUrl && (
                            <button onClick={() => setViewingProof(t.proofUrl)} className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold hover:bg-[var(--base)] transition-colors text-blue-600">
                              Lihat Bukti
                            </button>
                          )}
                          {t.status === "PENDING" && (
                            <>
                              <button disabled={updating === t.id} onClick={() => setConfirmModal({ isOpen: true, txId: t.id, status: "PAID" })} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                                Approve
                              </button>
                              <button disabled={updating === t.id} onClick={() => setConfirmModal({ isOpen: true, txId: t.id, status: "FAILED" })} className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50">
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Proof Preview Modal */}
      {viewingProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setViewingProof(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col bg-white rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
              <h3 className="font-bold text-slate-800 text-lg">Bukti Pembayaran</h3>
              <button onClick={() => setViewingProof(null)} className="text-slate-400 hover:text-slate-600 text-2xl font-bold p-2">&times;</button>
            </div>
            <div className="flex-1 overflow-auto bg-slate-50 p-6 flex items-center justify-center">
              <img src={viewingProof} alt="Bukti Pembayaran" className="max-w-full h-auto rounded-lg shadow-lg" />
            </div>
            
            {/* Quick Actions in Modal */}
            {transactions.find(tx => tx.proofUrl === viewingProof && tx.status === "PENDING") && (
              <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
                <button 
                  onClick={() => {
                    const tx = transactions.find(tx => tx.proofUrl === viewingProof);
                    if (tx) updateStatus(tx.id, "FAILED", "Ditolak oleh admin");
                  }}
                  className="px-6 py-2.5 rounded-xl border border-rose-200 text-rose-600 font-bold hover:bg-rose-50 transition-colors"
                >
                  Reject Pembayaran
                </button>
                <button 
                  onClick={() => {
                    const tx = transactions.find(tx => tx.proofUrl === viewingProof);
                    if (tx) updateStatus(tx.id, "PAID");
                  }}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-shadow shadow-lg shadow-emerald-600/20"
                >
                  Konfirmasi / Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    <PremiumModal
      isOpen={confirmModal.isOpen}
      onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
      onConfirm={() => updateStatus(confirmModal.txId, confirmModal.status)}
      title="Konfirmasi Status"
      message={`Apakah Anda yakin ingin menandai transaksi ini sebagai ${confirmModal.status}?`}
      type={confirmModal.status === "PAID" ? "success" : "delete"}
      confirmText="Ya, Proses"
      loading={updating === confirmModal.txId}
    />
  </>
  );
}
