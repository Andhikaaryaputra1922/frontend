"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, ExternalLink, MessageSquare, Package, X, AlertTriangle, RotateCcw } from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  provider: string | null;
  proofUrl: string | null;
  notes: string | null;
  createdAt: string;
  package: { id: string; name: string; price: number } | null;
  course: { id: string; title: string } | null;
}

const TABS = [
  { key: "ALL",     label: "Semua" },
  { key: "PENDING", label: "Menunggu" },
  { key: "PAID",    label: "Diperiksa" },
  { key: "FAILED",  label: "Gagal" },
];

const STATUS_MAP: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  PENDING:  { bg: "bg-amber-50",   text: "text-amber-700",  dot: "bg-amber-400",  label: "Menunggu Pembayaran" },
  PAID:     { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400", label: "Sedang Diperiksa" },
  FAILED:   { bg: "bg-rose-50",    text: "text-rose-700",   dot: "bg-rose-400",   label: "Gagal / Kedaluwarsa" },
  REFUNDED: { bg: "bg-slate-100",  text: "text-slate-600",  dot: "bg-slate-400",  label: "Dikembalikan" },
};

export default function CartPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading]           = useState(true);
  const [activeTab, setActiveTab]       = useState("ALL");

  // Cancel modal state
  const [cancelModal, setCancelModal]   = useState<{ open: boolean; txId: string; name: string }>({ open: false, txId: "", name: "" });
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [toastMsg, setToastMsg]         = useState<string | null>(null);

  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 3000); };

  const fetchData = () => {
    setLoading(true);
    const url = activeTab === "ALL"
      ? "/api/student/my-transactions"
      : `/api/student/my-transactions?status=${activeTab}`;
    fetch(url, { credentials: "include" })
      .then(r => r.json())
      .then(d => setTransactions(d.transactions ?? []))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [activeTab]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  /* Submit cancel request */
  const submitCancel = async () => {
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/student/my-transactions/${cancelModal.txId}/request-cancel`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason }),
      });
      if (res.ok) {
        showToast("Permintaan pembatalan terkirim. Tunggu konfirmasi admin.");
        setCancelModal({ open: false, txId: "", name: "" });
        setCancelReason("");
        fetchData();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || "Gagal mengirim permintaan");
      }
    } catch { showToast("Error jaringan"); }
    finally { setCancelLoading(false); }
  };

  /* Withdraw cancel request */
  const withdrawCancel = async (txId: string) => {
    const res = await fetch(`/api/student/my-transactions/${txId}/request-cancel`, {
      method: "DELETE", credentials: "include",
    });
    if (res.ok) { showToast("Request pembatalan ditarik."); fetchData(); }
  };

  const isCancelRequested = (tx: Transaction) => tx.notes?.startsWith("[CANCEL_REQUEST]") ?? false;

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-[300] bg-[#0B213F] text-white text-[12px] font-semibold px-5 py-3 rounded-xl shadow-xl animate-in slide-in-from-right">
          {toastMsg}
        </div>
      )}

      <div className="mx-auto max-w-6xl px-6 md:px-10 py-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Akun</p>
            <h1 className="text-2xl font-bold tracking-tight text-[#0B213F]">Riwayat Pembelian</h1>
            <p className="mt-1 text-sm text-slate-400">Pantau status pembayaran paket belajarmu.</p>
          </div>
          <Link href="/student/packages"
            className="shrink-0 flex items-center gap-2 bg-[#0B213F] text-[#D4AF37] px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all">
            <Package size={13} /> Beli Paket
          </Link>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-[11px] font-semibold transition-all ${
                activeTab === tab.key
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-slate-200">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <ShoppingCart size={28} className="text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-500">Belum ada transaksi</p>
            <p className="text-xs text-slate-400 mt-1 mb-5">Mulai belajar dengan memilih paket favoritmu.</p>
            <Link href="/student/packages"
              className="flex items-center gap-2 bg-[#0B213F] text-[#D4AF37] px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all">
              <Package size={13} /> Lihat Paket
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map(tx => {
              const badge      = STATUS_MAP[tx.status] ?? STATUS_MAP.REFUNDED;
              const cancelReq  = isCancelRequested(tx);
              const canCancel  = tx.status === "PENDING" && !cancelReq;

              return (
                <div key={tx.id}
                  className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all p-5 md:p-6 ${
                    cancelReq ? "border-orange-200" : "border-slate-200"
                  }`}>

                  {/* Cancel request banner */}
                  {cancelReq && (
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-orange-50 border border-orange-200 px-4 py-2.5 mb-4">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={13} className="text-orange-500 shrink-0" />
                        <p className="text-[11px] font-bold text-orange-700">
                          Permintaan pembatalan dikirim — menunggu konfirmasi admin
                        </p>
                      </div>
                      <button onClick={() => withdrawCancel(tx.id)}
                        className="flex items-center gap-1 text-[10px] font-bold text-orange-600 hover:text-orange-800 whitespace-nowrap">
                        <RotateCcw size={11} /> Tarik
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${badge.bg} ${badge.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {new Date(tx.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                      </div>
                      <h3 className="text-[14px] font-bold text-slate-800 truncate">
                        {tx.package?.name || tx.course?.title || "Transaksi"}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">
                        ID: {tx.id.slice(0, 16)}… · {tx.provider || "Transfer Manual"}
                      </p>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-3 shrink-0 flex-wrap">
                      <p className="text-lg font-black text-[#0B213F]">{fmt(tx.amount)}</p>

                      {tx.proofUrl && (
                        <a href={tx.proofUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg">
                          <ExternalLink size={12} /> Bukti
                        </a>
                      )}

                      {/* Tombol Minta Pembatalan */}
                      {canCancel && (
                        <button
                          onClick={() => setCancelModal({ open: true, txId: tx.id, name: tx.package?.name || tx.course?.title || "Transaksi" })}
                          className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition-all">
                          <X size={12} /> Minta Batal
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Notes (non-cancel) */}
                  {tx.notes && !cancelReq && (
                    <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                      <MessageSquare size={13} className="text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-slate-500 leading-relaxed">{tx.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Cancel Modal ── */}
      {cancelModal.open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setCancelModal({ open: false, txId: "", name: "" })}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center">
                  <AlertTriangle size={15} className="text-rose-500" />
                </div>
                <h3 className="text-[14px] font-bold text-slate-800">Minta Pembatalan</h3>
              </div>
              <button onClick={() => setCancelModal({ open: false, txId: "", name: "" })}
                className="text-slate-400 hover:text-slate-600 h-7 w-7 flex items-center justify-center rounded-lg hover:bg-slate-100">
                <X size={14} />
              </button>
            </div>
            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Transaksi</p>
                <p className="text-[13px] font-bold text-slate-800">{cancelModal.name}</p>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-widest block mb-2">
                  Alasan Pembatalan <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  placeholder="Jelaskan alasan pembatalan kamu..."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 resize-none transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Permintaan ini akan dikirim ke admin. Proses pembatalan tidak otomatis — admin akan meninjau dan memberikan keputusan.
              </p>
            </div>
            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button onClick={() => setCancelModal({ open: false, txId: "", name: "" })}
                className="px-4 py-2 text-[12px] font-semibold text-slate-500 hover:text-slate-700 transition-colors">
                Batal
              </button>
              <button
                onClick={submitCancel}
                disabled={!cancelReason.trim() || cancelLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white text-[12px] font-bold hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                {cancelLoading ? (
                  <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : <AlertTriangle size={13} />}
                Kirim Permintaan
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
