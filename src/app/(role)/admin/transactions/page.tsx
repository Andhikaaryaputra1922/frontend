"use client";

import { useState, useEffect, useCallback } from "react";
import { Toast } from "@/shared/components/ui/PremiumFeedback";
import { PremiumModal } from "@/shared/components/ui/PremiumFeedback";
import AdminPageLayout, {
  AdminButton, AdminTable, AdminSearch,
} from "@/features/users/components/layouts/AdminPageLayout";
import { CheckCircle2, XCircle, Eye, AlertTriangle } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Transaction {
  id: string; userId: string; packageId: string | null; courseId: string | null;
  amount: number; status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  paymentMethod: string | null; proofUrl: string | null; notes: string | null; createdAt: string;
  user: { id: string; name: string | null; email: string };
  package: { id: string; name: string } | null;
  course: { id: string; title: string } | null;
}

const STATUS_TABS = [
  { key: "ALL",     label: "Semua" },
  { key: "PENDING", label: "Menunggu" },
  { key: "PAID",    label: "Berhasil" },
  { key: "FAILED",  label: "Gagal" },
  { key: "CANCEL",  label: "Minta Batal" },
];

const fmtPrice = (p: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(p);

const fmtDate = (d: string) =>
  new Date(d).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [viewingProof, setViewingProof] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; txId: string; status: "PAID" | "FAILED" }>({ isOpen: false, txId: "", status: "PAID" });

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL("/api/admin/transactions", window.location.origin);
      if (activeTab !== "ALL") url.searchParams.set("status", activeTab);
      const res = await fetch(url.toString(), { credentials: "include" });
      if (res.ok) setTransactions((await res.json().catch(() => ({}))).transactions ?? []);
    } finally { setLoading(false); }
  }, [activeTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Update Status ──────────────────────────────────────────────────────────
  const updateStatus = async (txId: string, status: "PAID" | "FAILED", notes?: string) => {
    setUpdating(txId);
    try {
      const res = await fetch(`/api/admin/transactions/${txId}`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...(notes !== undefined && { notes }) }),
      });
      if (res.ok) {
        fetchData(); setViewingProof(null);
        setToast({ message: status === "PAID" ? "Pembayaran disetujui! Akses diberikan." : "Pembayaran ditolak.", type: status === "PAID" ? "success" : "info" });
      } else {
        const err = await res.json().catch(() => ({}));
        setToast({ message: err.message || "Gagal mengubah status", type: "error" });
      }
    } catch { setToast({ message: "Error jaringan", type: "error" }); }
    finally { setUpdating(null); setConfirmModal(p => ({ ...p, isOpen: false })); }
  };

  // ── Approve / Reject Cancel ───────────────────────────────────────────────
  const handleCancelDecision = async (txId: string, action: "approve" | "reject") => {
    setUpdating(txId);
    try {
      const res = await fetch(`/api/admin/transactions/${txId}/${action}-cancel`, {
        method: "POST", credentials: "include",
      });
      if (res.ok) {
        fetchData();
        setToast({ message: action === "approve" ? "Pembatalan disetujui." : "Request pembatalan ditolak.", type: action === "approve" ? "info" : "success" });
      } else {
        const err = await res.json().catch(() => ({}));
        setToast({ message: err.message || "Gagal", type: "error" });
      }
    } catch { setToast({ message: "Error jaringan", type: "error" }); }
    finally { setUpdating(null); }
  };

  // ── Filtered ──────────────────────────────────────────────────────────────
  const filtered = transactions.filter(t => {
    if (activeTab === "CANCEL") return t.notes?.startsWith("[CANCEL_REQUEST]");
    if (!search && activeTab === "ALL") return true;
    const q = search.toLowerCase();
    const matchSearch = !search || t.id.toLowerCase().includes(q) || (t.user.name?.toLowerCase() ?? "").includes(q) ||
      t.user.email.toLowerCase().includes(q) || (t.package?.name.toLowerCase() ?? "").includes(q);
    return matchSearch;
  });

  // ── Status badge ──────────────────────────────────────────────────────────
  const StatusChip = ({ status }: { status: string }) => {
    const s: Record<string, string> = {
      PAID: "bg-emerald-50 text-emerald-700",
      FAILED: "bg-rose-50 text-rose-700",
      PENDING: "bg-amber-50 text-amber-700",
      REFUNDED: "bg-slate-100 text-slate-500",
    };
    return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${s[status] ?? "bg-slate-100 text-slate-500"}`}>{status}</span>;
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AdminPageLayout
      title="Transaksi"
      subtitle="Pantau pembayaran siswa dan berikan akses kursus."
    >
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
        {/* Status tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
          {STATUS_TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-1.5 rounded-md text-[12px] font-semibold transition-all ${activeTab === t.key ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="w-60">
          <AdminSearch value={search} onChange={setSearch} placeholder="Cari siswa / ID..." />
        </div>
      </div>

      {/* Table */}
      <AdminTable
        headers={["ID & Waktu", "Siswa", "Pembelian", "Nominal", "Status", "Aksi"]}
        loading={loading}
        empty={!loading && filtered.length === 0}
      >
        {filtered.map(t => (
          <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-5 py-4">
              <code className="text-[11px] font-mono text-slate-400">#{t.id.slice(-8)}</code>
              <p className="text-[10px] text-slate-400 mt-0.5">{fmtDate(t.createdAt)}</p>
            </td>
            <td className="px-5 py-4">
              <p className="text-[13px] font-semibold text-slate-800">{t.user.name || "Tanpa Nama"}</p>
              <p className="text-[11px] text-slate-400">{t.user.email}</p>
            </td>
            <td className="px-5 py-4">
              {t.package ? (
                <>
                  <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Paket</span>
                  <p className="text-[12px] font-medium text-slate-700 mt-1">{t.package.name}</p>
                </>
              ) : t.course ? (
                <>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Kursus</span>
                  <p className="text-[12px] font-medium text-slate-700 mt-1">{t.course.title}</p>
                </>
              ) : <span className="text-[11px] text-slate-300">Lainnya</span>}
              <p className="text-[10px] text-slate-400 mt-0.5">{t.paymentMethod || "Transfer Manual"}</p>
            </td>
            <td className="px-5 py-4">
              <p className="text-[13px] font-semibold text-slate-800">{fmtPrice(t.amount)}</p>
              {t.notes?.startsWith("[CANCEL_REQUEST]") ? (
                <div className="flex items-center gap-1 mt-1">
                  <AlertTriangle size={10} className="text-orange-500 shrink-0" />
                  <p className="text-[10px] font-bold text-orange-600">Minta Batal</p>
                </div>
              ) : t.notes ? (
                <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[140px]">{t.notes}</p>
              ) : null}
            </td>
            <td className="px-5 py-4"><StatusChip status={t.status} /></td>
            <td className="px-5 py-4">
              <div className="flex items-center gap-2 flex-wrap">
                {t.proofUrl && (
                  <button onClick={() => setViewingProof(t.proofUrl)}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-medium text-slate-500 hover:bg-slate-50 transition-all">
                    <Eye size={11} /> Bukti
                  </button>
                )}
                {/* Tombol approve/reject CANCEL REQUEST — prioritas utama */}
                {t.notes?.startsWith("[CANCEL_REQUEST]") ? (
                  <>
                    <button disabled={updating === t.id}
                      onClick={() => handleCancelDecision(t.id, "approve")}
                      className="flex items-center gap-1 rounded-lg bg-orange-500 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-all">
                      <CheckCircle2 size={11} /> Setujui Batal
                    </button>
                    <button disabled={updating === t.id}
                      onClick={() => handleCancelDecision(t.id, "reject")}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-all">
                      <XCircle size={11} /> Tolak
                    </button>
                  </>
                ) : t.status === "PENDING" ? (
                  <>
                    <button disabled={updating === t.id}
                      onClick={() => setConfirmModal({ isOpen: true, txId: t.id, status: "PAID" })}
                      className="flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-600 disabled:opacity-50 transition-all">
                      <CheckCircle2 size={11} /> Approve
                    </button>
                    <button disabled={updating === t.id}
                      onClick={() => setConfirmModal({ isOpen: true, txId: t.id, status: "FAILED" })}
                      className="flex items-center gap-1 rounded-lg bg-rose-500 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-rose-600 disabled:opacity-50 transition-all">
                      <XCircle size={11} /> Reject
                    </button>
                  </>
                ) : null}
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      {/* ── Proof Preview ── */}
      {viewingProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setViewingProof(null)}>
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800">Bukti Pembayaran</h3>
              <button onClick={() => setViewingProof(null)} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
            </div>
            <div className="bg-slate-50 p-6 flex items-center justify-center">
              <img src={viewingProof} alt="Bukti" className="max-h-[60vh] w-auto rounded-lg" />
            </div>
            {transactions.find(tx => tx.proofUrl === viewingProof && tx.status === "PENDING") && (
              <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-3">
                <AdminButton variant="danger" onClick={() => {
                  const tx = transactions.find(tx => tx.proofUrl === viewingProof);
                  if (tx) updateStatus(tx.id, "FAILED", "Ditolak oleh admin");
                }}>Reject</AdminButton>
                <AdminButton onClick={() => {
                  const tx = transactions.find(tx => tx.proofUrl === viewingProof);
                  if (tx) updateStatus(tx.id, "PAID");
                }}>Approve</AdminButton>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm modal */}
      <PremiumModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(p => ({ ...p, isOpen: false }))}
        onConfirm={() => updateStatus(confirmModal.txId, confirmModal.status)}
        title="Konfirmasi Status"
        message={`Tandai transaksi ini sebagai ${confirmModal.status}?`}
        type={confirmModal.status === "PAID" ? "success" : "delete"}
        confirmText="Ya, Proses"
        loading={updating === confirmModal.txId}
      />
    </AdminPageLayout>
  );
}
