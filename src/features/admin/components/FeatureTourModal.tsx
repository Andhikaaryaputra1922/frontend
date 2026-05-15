"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Icons for the Modal ─────────────────── */
const IC = {
  Layout: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
    </svg>
  ),
  Users: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  CreditCard: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  Courses: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Sparkles: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  ),
  Arrow: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
};

export function FeatureTourModal({ onClose }: { onClose: () => void }) {
  const [activeFeature, setActiveFeature] = useState<number | null>(null);

  const features = [
    {
      title: "Dashboard Overview",
      desc: "Pantau metrik utama, pendapatan, dan statistik siswa secara real-time.",
      detail: "Lihat grafik pendapatan mingguan, pantau jumlah pendaftaran siswa baru secara live, dan cek status server serta database dalam satu layar utama untuk pengambilan keputusan yang cepat.",
      icon: <IC.Layout />,
      color: "bg-[#1A2E44]",
    },
    {
      title: "Manajemen Pengguna",
      desc: "Kontrol penuh atas data siswa, pengajar, dan hak akses administratif.",
      detail: "Gunakan fitur pencarian untuk menemukan akun, edit profil, ubah role (Admin/Teacher/Student), atau nonaktifkan akun yang melanggar aturan platform.",
      icon: <IC.Users />,
      color: "bg-[#1A2E44]",
    },
    {
      title: "Verifikasi Pembayaran",
      desc: "Konfirmasi bukti transfer dan aktivasi paket belajar secara instan.",
      detail: "Masuk ke daftar transaksi manual, buka lampiran bukti transfer dari siswa, verifikasi nominalnya, lalu klik 'Approve' untuk aktivasi paket secara otomatis tanpa delay.",
      icon: <IC.CreditCard />,
      color: "bg-[#1A2E44]",
    },
    {
      title: "Kurikulum & Kursus",
      desc: "Susun materi belajar, video, dan kuis dalam struktur yang rapi.",
      detail: "Buat Course baru, tambahkan bab (Chapter), dan isi dengan materi (Lesson) berupa video atau teks. Anda juga bisa menambahkan kuis evaluasi untuk setiap kursus.",
      icon: <IC.Courses />,
      color: "bg-[#1A2E44]",
    },
    {
      title: "Penjadwalan Otomatis",
      desc: "Kelola sisa pertemuan dan jadwal bimbingan siswa dengan transparan.",
      detail: "Atur slot waktu bimbingan, pantau sisa pertemuan yang dimiliki siswa, dan catat kehadiran secara otomatis setiap kali sesi bimbingan selesai dilakukan.",
      icon: <IC.Calendar />,
      color: "bg-[#1A2E44]",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1A2E44]/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200"
      >
        <div className="relative p-6 md:p-8 text-slate-900">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A2E44] text-[#E5B54F]">
                <IC.Sparkles />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[#1A2E44]">Pusat Bantuan Admin</h2>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Guide & Support</p>
              </div>
            </div>
            {activeFeature !== null ? (
              <button 
                onClick={() => setActiveFeature(null)}
                className="text-xs font-bold text-[#E5B54F] hover:underline"
              >
                Kembali
              </button>
            ) : (
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-[#1A2E44] transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            )}
          </div>

          <div className="relative min-h-[360px]">
            <AnimatePresence mode="wait">
              {activeFeature === null ? (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid gap-3"
                >
                  {features.map((f, i) => (
                    <motion.button
                      key={f.title}
                      onClick={() => setActiveFeature(i)}
                      className="group flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-[#E5B54F]/30 hover:shadow-lg transition-all text-left"
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${f.color} text-[#E5B54F]`}>
                        {f.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-[#1A2E44]">{f.title}</h3>
                        <p className="mt-0.5 text-[11px] font-medium text-slate-500 leading-tight">{f.desc}</p>
                      </div>
                      <div className="text-slate-300 group-hover:text-[#E5B54F] transition-colors">
                        <IC.Arrow />
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col h-full bg-slate-50 rounded-2xl p-6 border border-slate-100"
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${features[activeFeature].color} text-[#E5B54F] shadow-lg mb-4`}>
                    {features[activeFeature].icon}
                  </div>
                  <h3 className="text-lg font-bold text-[#1A2E44] mb-4">{features[activeFeature].title}</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#E5B54F] mb-2">Panduan Penggunaan:</h4>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed">
                        {features[activeFeature].detail}
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-white border-l-4 border-[#E5B54F]">
                      <div className="text-[10px] font-bold text-[#1A2E44] uppercase tracking-wider mb-1">Tips:</div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Gunakan fitur pencarian dan filter di modul ini untuk memproses data lebih cepat.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveFeature(null)}
                    className="mt-8 text-xs font-bold text-[#1A2E44]/50 hover:text-[#1A2E44] transition-colors"
                  >
                    ← Kembali ke menu bantuan
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Haneen Academy Support</span>
            <span className="text-[#E5B54F]">v1.0.0</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
