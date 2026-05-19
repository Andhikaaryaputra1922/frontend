"use client";

import React, { createContext, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LegalModalContextType {
  showSyarat: () => void;
  showPrivasi: () => void;
}

const LegalModalContext = createContext<LegalModalContextType | null>(null);

export const useLegalModal = () => {
  const context = useContext(LegalModalContext);
  if (!context) throw new Error("useLegalModal must be used within LegalModalProvider");
  return context;
};

export function LegalModalProvider({ children }: { children: React.ReactNode }) {
  const [legalModal, setLegalModal] = useState<{ title: string; content: string } | null>(null);

  const showSyarat = () => setLegalModal({
    title: "Syarat & Ketentuan",
    content: `HANEEN ACADEMY

Selamat datang di Haneen Academy!

Haneen Academy merupakan platform pembelajaran online yang berfokus pada pendidikan dan pembelajaran Bahasa Arab, baik untuk pemula maupun tingkat lanjutan. Seiring berkembangnya platform, Haneen Academy dapat menghadirkan program pembelajaran, kelas, layanan, dan fitur pendidikan lainnya sesuai kebutuhan pengguna. Aplikasi dan situs website Haneen Academy dikelola oleh Haneen Academy (“Kami”).

KETENTUAN UMUM

Pengakses atau calon Pengguna wajib membaca Syarat dan Ketentuan yang berlaku dengan seksama sebelum menggunakan layanan dan produk belajar dari Kami. Syarat dan Ketentuan ini berlaku untuk seluruh Pengguna platform dan berkaitan dengan hak serta kewajiban berdasarkan hukum yang berlaku.
Secara umum, Pengguna harus berusia sekurang-kurangnya 18 (delapan belas) tahun atau memiliki kecakapan hukum untuk mengikatkan diri. Bagi Pengguna yang belum memenuhi syarat usia, setiap tindakan pendaftaran dan penggunaan platform hanya dapat dilakukan dengan persetujuan dan pengawasan orang tua atau wali sah.
Dengan mendaftar atau menggunakan platform, Pengguna mengakui telah membaca, memahami, dan menyetujui seluruh isi dalam Syarat dan Ketentuan ini sebagai perjanjian sah antara Haneen Academy dan Pengguna.

PRODUK BELAJAR

Produk belajar Kami mencakup namun tidak terbatas pada:
1. Kelas online Bahasa Arab
2. Video pembelajaran & rekaman kelas
3. Quiz, tugas, dan materi digital
4. Sertifikat pembelajaran

Produk belajar dapat diperbarui atau dikembangkan sewaktu-waktu sesuai kebutuhan platform. Produk berbayar memiliki masa akses tertentu sesuai informasi pada masing-masing paket. Pengguna hanya diperkenankan mengakses produk melalui kanal resmi Haneen Academy.

AKUN PENGGUNA

1. Satu akun hanya berlaku untuk satu Pengguna.
2. Pengguna dilarang membagikan akses akun kepada pihak lain tanpa izin resmi.
3. Pengguna wajib menggunakan identitas asli dan data yang benar saat pendaftaran.
4. Pengguna bertanggung jawab penuh atas keamanan akun, kata sandi, dan seluruh aktivitas di dalamnya.
5. Kami berhak menonaktifkan akun apabila ditemukan indikasi pelanggaran.

PERILAKU PENGGUNA

Pengguna wajib menjaga etika dan sopan santun selama menggunakan platform. Dilarang keras mengganggu kegiatan belajar, menggunakan ujaran kebencian, menyebarkan spam, atau melakukan tindakan yang merugikan pihak lain. Pelanggaran dapat mengakibatkan pembatasan akses hingga penonaktifan akun permanen.

BIAYA DAN PEMBAYARAN

1. Pembayaran dilakukan melalui metode resmi yang tersedia pada platform.
2. Harga produk dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya.
3. Pembayaran yang telah berhasil tidak dapat dikembalikan, kecuali terdapat kesalahan sistem fatal dari pihak Kami.

KEBIJAKAN PENGEMBALIAN DANA

Pengembalian dana hanya dipertimbangkan dalam kondisi:
1. Terjadi pembayaran ganda (double payment).
2. Terdapat kelebihan transfer yang terverifikasi.
Kesalahan dalam memilih paket belajar sepenuhnya merupakan tanggung jawab Pengguna.

HAK KEKAYAAN INTELEKTUAL

Seluruh konten termasuk logo, desain, video, modul, dan sistem pembelajaran merupakan hak milik eksklusif Haneen Academy. Pengguna dilarang keras menyalin, menjual ulang, atau menyebarluaskan materi kepada pihak lain untuk kepentingan komersial tanpa izin tertulis. Kami akan mengambil tindakan hukum tegas terhadap setiap pelanggaran hak intelektual.

KEADAAN KAHAR (FORCE MAJEURE)

Kami tidak bertanggung jawab atas gangguan layanan yang disebabkan oleh kejadian di luar kendali manusia (bencana alam, gangguan jaringan nasional, pemadaman listrik masal, atau serangan siber).

KETENTUAN PENUTUP

Kami berhak menyesuaikan Syarat dan Ketentuan ini sewaktu-waktu. Pengguna disarankan untuk memeriksa halaman ini secara berkala. Dengan tetap menggunakan layanan Haneen Academy, Pengguna dianggap menyetujui setiap perubahan yang ada.

Hubungi kontak resmi Haneen Academy jika Anda memiliki pertanyaan lebih lanjut terkait layanan Kami.`
  });

  const showPrivasi = () => setLegalModal({
    title: "Kebijakan Privasi",
    content: "Privasi Anda adalah prioritas kami. Data yang Anda berikan akan digunakan secara profesional untuk keperluan akademik dan peningkatan layanan. Kami tidak akan membagikan informasi pribadi Anda kepada pihak ketiga tanpa izin tertulis sesuai hukum yang berlaku."
  });

  return (
    <LegalModalContext.Provider value={{ showSyarat, showPrivasi }}>
      {children}

      {/* ── Legal Modal Overlay ── */}
      <AnimatePresence>
        {legalModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLegalModal(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-2xl font-black tracking-tight text-[#0B213F]">{legalModal.title}</h3>
                <button
                  onClick={() => setLegalModal(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-[#0B213F] transition-all"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <div className="max-h-[70vh] overflow-y-auto pr-4 custom-scrollbar">
                <div className="text-[14px] leading-tight text-slate-700">
                  {legalModal.content.split("\n").map((line, index) => {
                    const trimmed = line.trim();
                    const isHeader = /^[A-Z\s\(\)]+$/.test(trimmed) && trimmed.length > 5;
                    const isNumberedHeader = /^\d+\.\s+[A-Z\s\(\)]+$/.test(trimmed);
                    const isListItem = /^\d+\.\s+/.test(trimmed) || trimmed.startsWith("•");

                    if (isHeader || isNumberedHeader) {
                      return (
                        <div key={index} className="text-[18px] font-black text-[#0B213F] mt-6 mb-2 tracking-tight leading-none">
                          {trimmed}
                        </div>
                      );
                    }

                    if (trimmed === "") return <div key={index} className="h-2" />;

                    return (
                      <div key={index} className={`mb-1 ${isListItem ? "pl-2" : ""}`}>
                        {line}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-12 flex items-center justify-between">
                  <p className="text-[13px] italic text-slate-400">
                    Diupdate terakhir pada Mei 2026
                  </p>
                  <button
                    onClick={() => setLegalModal(null)}
                    className="px-10 py-3 rounded-full bg-white border border-slate-100 text-slate-600 text-sm font-bold shadow-sm hover:bg-slate-50 hover:shadow-md active:scale-95 transition-all"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </LegalModalContext.Provider>
  );
}
