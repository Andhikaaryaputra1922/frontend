"use client";

import { useEffect, useState } from "react";

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
  { key: "ALL", label: "Semua" },
  { key: "PENDING", label: "Menunggu Pembayaran" },
  { key: "PAID", label: "Sedang Diperiksa" },
  { key: "FAILED", label: "Kedaluwarsa" },
];

export default function CartPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");

  useEffect(() => {
    setLoading(true);
    const url = activeTab === "ALL"
      ? "/api/student/my-transactions"
      : `/api/student/my-transactions?status=${activeTab}`;
    fetch(url, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setTransactions(d.transactions ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeTab]);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(p);

  const statusBadge = (s: string) => {
    const m: Record<string, { bg: string; text: string; label: string }> = {
      PENDING: { bg: "bg-amber-100", text: "text-amber-800", label: "Menunggu" },
      PAID: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Berhasil" },
      FAILED: { bg: "bg-red-100", text: "text-red-700", label: "Gagal" },
      REFUNDED: { bg: "bg-slate-100", text: "text-slate-600", label: "Refund" },
    };
    return m[s] ?? { bg: "bg-slate-100", text: "text-slate-600", label: s };
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] p-10 lg:p-16">
      <div className="mx-auto max-w-4xl">
        <header className="mb-12">
           <h1 className="text-4xl font-black text-[#1A2E44] tracking-tight">Riwayat Pembelian</h1>
           <p className="text-slate-400 font-medium mt-2">Pantau status pembayaran paket belajar Anda di sini.</p>
        </header>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-slate-200 mb-10 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "text-[#1A2E44]"
                  : "text-slate-300 hover:text-slate-500"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-[#E5B54F]" />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1A2E44] border-t-transparent" />
            <p className="text-sm font-bold text-[#1A2E44] opacity-40">Memuat transaksi...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[40px] shadow-sm border border-white">
            <div className="h-20 w-20 bg-[#FAF9F6] rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="text-slate-300" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                 <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
               </svg>
            </div>
            <p className="text-xl font-black text-[#1A2E44]">Belum ada transaksi</p>
            <p className="text-sm text-slate-400 mt-2 font-medium">Mulai belajar dengan memilih paket favoritmu!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {transactions.map((tx) => {
              const badge = statusBadge(tx.status);
              return (
                <div key={tx.id} className="group rounded-[32px] border border-white bg-white p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                          {new Date(tx.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-[#1A2E44] group-hover:text-[#E5B54F] transition-colors">
                        {tx.package?.name || tx.course?.title || "Transaksi"}
                      </h3>
                      <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wide">
                        ID: {tx.id.slice(0, 16)}... · {tx.provider || "Manual Transfer"}
                      </p>
                    </div>
                    <div className="text-left md:text-right shrink-0 border-t md:border-t-0 md:border-l border-slate-50 pt-6 md:pt-0 md:pl-10">
                      <p className="text-2xl font-black text-[#1A2E44] tracking-tight">{formatPrice(tx.amount)}</p>
                      {tx.proofUrl && (
                        <a href={tx.proofUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 mt-3 text-xs font-black text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest">
                          <span>Bukti Transfer</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        </a>
                      )}
                    </div>
                  </div>
                  {tx.notes && (
                    <div className="mt-6 flex gap-3 items-start bg-[#FAF9F6] rounded-2xl p-4 border border-slate-100">
                       <div className="h-6 w-6 rounded-lg bg-white flex items-center justify-center text-slate-300 shrink-0">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                       </div>
                       <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        {tx.notes}
                       </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
