"use client";

import { useState } from "react";
import { 
  Search, LayoutDashboard, CalendarDays, Package, Users,
  CreditCard, Clock, ClipboardList, Award, BookOpen,
  ChevronDown, Settings, MessageSquare, ExternalLink, Video
} from "lucide-react";
import Link from "next/link";

interface HelpItem {
  question: string;
  answer: string;
}

interface HelpCategory {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  items: HelpItem[];
}

const helpCategories: HelpCategory[] = [
  {
    id: "dashboard",
    icon: <LayoutDashboard size={18} />,
    title: "Dashboard",
    description: "Memahami ringkasan statistik dan navigasi utama",
    items: [
      {
        question: "Apa yang ditampilkan di Dashboard Admin?",
        answer: "Dashboard menampilkan ringkasan lengkap platform: total siswa aktif, total guru, pendapatan bulan ini, jumlah transaksi, jadwal hari ini, dan grafik pertumbuhan. Semua data diperbarui secara real-time setiap kali halaman dibuka."
      },
      {
        question: "Bagaimana cara membaca grafik pendapatan?",
        answer: "Grafik pendapatan menampilkan tren pemasukan per bulan. Anda bisa melihat perbandingan dengan bulan sebelumnya melalui indikator persentase di kartu statistik. Warna hijau menandakan peningkatan, merah menandakan penurunan."
      },
      {
        question: "Bisakah saya mengekspor data Dashboard?",
        answer: "Saat ini data Dashboard ditampilkan secara visual. Untuk data transaksi detail, buka halaman Transaksi untuk melihat riwayat lengkap. Fitur ekspor tersedia di beberapa halaman seperti Presensi dan Transaksi."
      },
    ],
  },
  {
    id: "batches",
    icon: <CalendarDays size={18} />,
    title: "Angkatan (Batch)",
    description: "Mengelola batch/angkatan siswa per kursus",
    items: [
      {
        question: "Apa itu Angkatan/Batch?",
        answer: "Batch adalah pengelompokan siswa berdasarkan periode pendaftaran. Misalnya 'Batch 01 - Januari 2026' untuk siswa yang mendaftar di bulan Januari. Ini membantu mengorganisir siswa dan membedakan akses materi per gelombang."
      },
      {
        question: "Bagaimana cara membuat Batch baru?",
        answer: "Buka halaman Angkatan, klik 'Tambah Batch'. Pilih kursus yang terkait, beri nama batch (contoh: Batch 02), dan tentukan tanggal mulai. Batch yang aktif akan otomatis menerima siswa baru yang mendaftar."
      },
      {
        question: "Bisakah satu siswa masuk ke beberapa Batch?",
        answer: "Ya, satu siswa bisa terdaftar di beberapa batch untuk kursus yang berbeda. Setiap batch terhubung ke satu kursus tertentu. Siswa akan melihat materi sesuai batch yang mereka ikuti."
      },
      {
        question: "Bagaimana menonaktifkan Batch lama?",
        answer: "Di daftar batch, klik tombol status untuk mengubah batch menjadi tidak aktif. Batch yang tidak aktif tidak akan menerima pendaftaran baru, tapi siswa yang sudah terdaftar tetap bisa mengakses materi."
      },
    ],
  },
  {
    id: "packages",
    icon: <Package size={18} />,
    title: "Paket",
    description: "Mengelola paket program dan harga",
    items: [
      {
        question: "Bagaimana cara membuat Paket baru?",
        answer: "Buka halaman Paket, klik 'Tambah Paket'. Isi nama paket, harga, deskripsi, durasi akses (dalam hari), dan pilih kursus yang termasuk dalam paket. Anda juga bisa menambahkan fitur-fitur unggulan yang akan ditampilkan ke calon siswa."
      },
      {
        question: "Apa bedanya Paket dengan Kursus?",
        answer: "Kursus adalah satu mata pelajaran (misalnya 'Tajwid Dasar'). Paket adalah bundel yang bisa berisi satu atau lebih kursus dengan harga tertentu. Siswa membeli Paket untuk mendapatkan akses ke kursus-kursus di dalamnya."
      },
      {
        question: "Bisakah mengubah harga Paket yang sudah ada?",
        answer: "Ya, Anda bisa mengedit harga paket kapan saja. Perubahan harga hanya berlaku untuk pendaftaran baru. Siswa yang sudah membeli paket sebelumnya tidak terpengaruh oleh perubahan harga."
      },
      {
        question: "Bagaimana cara mengatur durasi akses Paket?",
        answer: "Saat membuat atau mengedit paket, isi field 'Default Lesson Limit' untuk menentukan jumlah hari akses. Misalnya, isi 90 untuk akses 3 bulan. Setelah masa aktif habis, siswa perlu memperpanjang langganan."
      },
    ],
  },
  {
    id: "users",
    icon: <Users size={18} />,
    title: "Manajemen User",
    description: "Mengelola akun siswa, guru, dan admin",
    items: [
      {
        question: "Bagaimana cara menambah user baru?",
        answer: "Buka halaman User, klik 'Tambah User'. Isi nama, email, dan pilih role (Student/Teacher/Admin). Untuk guru, Anda bisa langsung menugaskan ke kursus tertentu. User baru akan mendapat password default yang bisa diubah saat login pertama."
      },
      {
        question: "Bagaimana cara mengubah role user?",
        answer: "Di daftar user, klik edit pada user yang ingin diubah. Pilih role baru (Student, Teacher, atau Admin). Perubahan role akan langsung mempengaruhi akses dan menu yang tersedia untuk user tersebut."
      },
      {
        question: "Bisakah saya menonaktifkan akun user?",
        answer: "Ya, Anda bisa menonaktifkan akun user yang bermasalah atau tidak aktif. User yang dinonaktifkan tidak bisa login tapi datanya tetap tersimpan. Anda bisa mengaktifkan kembali kapan saja."
      },
      {
        question: "Bagaimana menugaskan guru ke kursus?",
        answer: "Saat mengedit profil guru, terdapat opsi untuk menambahkan guru ke satu atau lebih kursus. Guru yang sudah ditugaskan akan melihat kursus tersebut di menu 'Kursus Saya' pada panel pengajar mereka."
      },
    ],
  },
  {
    id: "transactions",
    icon: <CreditCard size={18} />,
    title: "Transaksi",
    description: "Memantau pembayaran dan konfirmasi transaksi",
    items: [
      {
        question: "Bagaimana cara mengonfirmasi pembayaran siswa?",
        answer: "Buka halaman Transaksi, cari transaksi dengan status 'Menunggu Konfirmasi'. Klik untuk melihat detail dan bukti pembayaran yang diupload siswa. Setelah memverifikasi, klik 'Konfirmasi' untuk mengaktifkan akses paket siswa, atau 'Tolak' jika pembayaran tidak valid."
      },
      {
        question: "Apa saja status transaksi yang tersedia?",
        answer: "Ada beberapa status: 'Pending' (belum bayar), 'Menunggu Konfirmasi' (bukti sudah diupload), 'Aktif/Berhasil' (pembayaran dikonfirmasi), dan 'Ditolak' (pembayaran tidak valid). Status akan berubah otomatis sesuai alur proses."
      },
      {
        question: "Bisakah melihat riwayat transaksi per siswa?",
        answer: "Ya, Anda bisa memfilter transaksi berdasarkan nama siswa, status pembayaran, atau rentang tanggal. Ini membantu melacak riwayat pembayaran individual dan menyelesaikan keluhan siswa terkait pembayaran."
      },
    ],
  },
  {
    id: "schedules",
    icon: <Clock size={18} />,
    title: "Jadwal",
    description: "Mengatur jadwal kelas dan sesi pertemuan",
    items: [
      {
        question: "Bagaimana cara membuat jadwal kelas?",
        answer: "Buka halaman Jadwal, klik 'Tambah Jadwal'. Pilih kursus, guru pengajar, hari, dan jam mulai/selesai. Jadwal yang dibuat akan otomatis muncul di panel guru dan siswa yang terdaftar di kursus tersebut."
      },
      {
        question: "Bisakah membuat jadwal berulang?",
        answer: "Ya, saat membuat jadwal Anda bisa memilih pola berulang (mingguan). Misalnya, setiap Senin pukul 19:00-20:30. Jadwal akan otomatis terulang setiap minggu tanpa perlu membuat ulang."
      },
      {
        question: "Bagaimana jika guru berhalangan mengajar?",
        answer: "Anda bisa mengedit jadwal untuk mengganti guru pengganti, atau menonaktifkan jadwal untuk sesi tertentu. Siswa akan melihat perubahan jadwal secara real-time di dashboard mereka."
      },
    ],
  },
  {
    id: "attendance",
    icon: <ClipboardList size={18} />,
    title: "Presensi",
    description: "Memantau dan mengelola data kehadiran",
    items: [
      {
        question: "Siapa yang bisa mengisi presensi?",
        answer: "Presensi bisa diisi oleh Guru yang mengajar kelas tersebut. Admin bisa melihat semua data presensi dari semua kelas, memantau statistik kehadiran, dan menindaklanjuti siswa yang sering absen."
      },
      {
        question: "Bagaimana melihat statistik kehadiran?",
        answer: "Di halaman Presensi, Anda bisa melihat ringkasan kehadiran per kursus dan per siswa. Data ditampilkan dalam bentuk persentase dan status (Hadir, Izin, Sakit, Alfa). Anda bisa memfilter berdasarkan periode waktu tertentu."
      },
      {
        question: "Bisakah Admin mengedit presensi yang sudah diisi guru?",
        answer: "Ya, Admin memiliki akses untuk mengedit presensi jika terjadi kesalahan input. Klik pada sesi presensi yang ingin diubah, edit status kehadiran siswa, lalu simpan ulang."
      },
    ],
  },
  {
    id: "certificates",
    icon: <Award size={18} />,
    title: "Sertifikat",
    description: "Mengelola template dan penerbitan sertifikat",
    items: [
      {
        question: "Bagaimana cara menerbitkan sertifikat?",
        answer: "Buka halaman Sertifikat, pilih siswa dan kursus yang telah diselesaikan. Sistem akan membuat sertifikat berdasarkan template yang tersedia. Anda bisa melakukan pratinjau sebelum menerbitkan. Setelah diterbitkan, siswa bisa mengunduh sertifikat dari dashboard mereka."
      },
      {
        question: "Bisakah membuat template sertifikat sendiri?",
        answer: "Saat ini sistem menyediakan template standar Haneen Academy. Sertifikat otomatis mencantumkan nama siswa, nama kursus, tanggal penyelesaian, dan nomor sertifikat unik untuk verifikasi."
      },
      {
        question: "Apakah sertifikat bisa diverifikasi?",
        answer: "Ya, setiap sertifikat memiliki kode unik yang bisa diverifikasi keasliannya. Pihak ketiga bisa memasukkan kode tersebut untuk mengonfirmasi bahwa sertifikat diterbitkan secara resmi oleh Haneen Academy."
      },
    ],
  },
  {
    id: "courses",
    icon: <BookOpen size={18} />,
    title: "Mata Pelajaran",
    description: "Mengelola kursus, kategori, dan pengajar",
    items: [
      {
        question: "Bagaimana cara membuat kursus baru?",
        answer: "Buka halaman Mata Pelajaran, klik 'Tambah Kursus'. Isi judul, deskripsi, kategori, level kesulitan, dan upload thumbnail. Pilih tipe akses (gratis/berbayar) dan tugaskan guru pengajar. Kursus baru akan muncul di panel guru yang ditugaskan."
      },
      {
        question: "Apa saja level kursus yang tersedia?",
        answer: "Tersedia beberapa level: Pemula (Beginner), Menengah (Intermediate), dan Lanjutan (Advanced). Level ini membantu siswa memilih kursus yang sesuai dengan kemampuan mereka."
      },
      {
        question: "Bagaimana menugaskan guru ke kursus?",
        answer: "Saat membuat atau mengedit kursus, terdapat field untuk memilih guru pengajar. Anda bisa menugaskan satu atau lebih guru ke satu kursus. Guru yang ditugaskan akan mendapat akses untuk mengelola kurikulum dan materi kursus tersebut."
      },
      {
        question: "Bisakah satu kursus dimasukkan ke beberapa paket?",
        answer: "Ya, satu kursus bisa menjadi bagian dari beberapa paket yang berbeda. Ini memungkinkan Anda membuat variasi paket dengan kombinasi kursus yang berbeda-beda."
      },
    ],
  },
  {
    id: "settings",
    icon: <Settings size={18} />,
    title: "Pengaturan",
    description: "Mengelola profil admin dan konfigurasi sistem",
    items: [
      {
        question: "Bagaimana mengubah profil Admin?",
        answer: "Buka halaman Pengaturan di bagian bawah sidebar. Anda bisa mengubah nama, foto profil, nomor telepon, dan bio. Perubahan akan langsung tersimpan setelah klik 'Update System Profile'."
      },
      {
        question: "Apakah bisa menambah Admin baru?",
        answer: "Ya, buka halaman User dan buat user baru dengan role 'Admin'. Admin baru akan memiliki akses penuh ke semua fitur panel administrasi. Pastikan hanya memberikan akses admin kepada orang yang terpercaya."
      },
      {
        question: "Bagaimana mengamankan akun Admin?",
        answer: "Gunakan password yang kuat (minimal 8 karakter dengan kombinasi huruf, angka, dan simbol). Jangan bagikan kredensial login Anda. Logout dari perangkat publik setelah selesai menggunakan panel admin."
      },
    ],
  },
];

export default function AdminHelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openCategory, setOpenCategory] = useState<string | null>("dashboard");
  const [openItem, setOpenItem] = useState<string | null>(null);

  const filtered = searchQuery.trim()
    ? helpCategories.map(cat => ({
        ...cat,
        items: cat.items.filter(
          item =>
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(cat => cat.items.length > 0)
    : helpCategories;

  const totalQuestions = helpCategories.reduce((sum, cat) => sum + cat.items.length, 0);

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-6 md:p-10">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tight text-[#0B213F] md:text-4xl">
            Pusat Bantuan
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-400">
            Panduan lengkap untuk semua fitur di Panel Admin — {totalQuestions} pertanyaan tersedia
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari pertanyaan atau topik..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-6 text-sm font-semibold text-[#0B213F] placeholder:text-slate-300 focus:border-[#0B213F] focus:outline-none focus:ring-2 focus:ring-[#0B213F]/10 transition-all shadow-sm"
          />
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {helpCategories.slice(0, 5).map(cat => (
            <button
              key={cat.id}
              onClick={() => { setOpenCategory(cat.id); setSearchQuery(""); }}
              className={`p-4 rounded-xl border text-left transition-all ${
                openCategory === cat.id && !searchQuery
                  ? "border-[#0B213F] bg-[#0B213F]/5"
                  : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center mb-2 ${
                openCategory === cat.id && !searchQuery ? "bg-[#0B213F] text-white" : "bg-slate-100 text-slate-400"
              }`}>
                {cat.icon}
              </div>
              <p className="text-xs font-black text-[#0B213F] truncate">{cat.title}</p>
            </button>
          ))}
        </div>

        {/* FAQ accordion */}
        <div className="space-y-4">
          {filtered.length === 0 && (
            <div className="text-center py-16 rounded-2xl border border-dashed border-slate-200 bg-white">
              <p className="text-sm font-bold text-slate-400">Tidak ditemukan hasil untuk &ldquo;{searchQuery}&rdquo;</p>
              <button onClick={() => setSearchQuery("")} className="mt-3 text-xs font-black text-[#0B213F] hover:underline">
                Reset pencarian
              </button>
            </div>
          )}

          {filtered.map(cat => {
            const isOpen = searchQuery ? true : openCategory === cat.id;
            return (
              <div key={cat.id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                {/* Category header */}
                <button
                  onClick={() => setOpenCategory(isOpen && !searchQuery ? null : cat.id)}
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50/50 transition-colors"
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isOpen ? "bg-[#0B213F] text-white" : "bg-slate-100 text-slate-400"
                  }`}>
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-[#0B213F]">{cat.title}</p>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">{cat.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider">{cat.items.length} FAQ</span>
                    <ChevronDown size={16} className={`text-slate-300 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {/* Items */}
                {isOpen && (
                  <div className="border-t border-slate-100">
                    {cat.items.map((item, idx) => {
                      const itemKey = `${cat.id}-${idx}`;
                      const itemOpen = openItem === itemKey;
                      return (
                        <div key={idx} className="border-b border-slate-50 last:border-b-0">
                          <button
                            onClick={() => setOpenItem(itemOpen ? null : itemKey)}
                            className="w-full flex items-start gap-3 p-5 pl-[4.5rem] text-left hover:bg-slate-50/50 transition-colors"
                          >
                            <div className={`mt-0.5 h-5 w-5 rounded-md flex items-center justify-center shrink-0 text-[10px] font-black transition-colors ${
                              itemOpen ? "bg-[#D4AF37] text-white" : "bg-slate-100 text-slate-400"
                            }`}>
                              Q
                            </div>
                            <p className={`flex-1 text-sm font-bold transition-colors ${itemOpen ? "text-[#0B213F]" : "text-slate-600"}`}>
                              {item.question}
                            </p>
                            <ChevronDown size={14} className={`text-slate-300 shrink-0 mt-0.5 transition-transform duration-300 ${itemOpen ? "rotate-180" : ""}`} />
                          </button>
                          {itemOpen && (
                            <div className="px-5 pl-[5.5rem] pb-5 -mt-1">
                              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                {item.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact card */}
        <div className="mt-10 rounded-2xl bg-[#0B213F] p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex-1">
            <h3 className="text-base font-black text-white mb-1">Butuh bantuan teknis?</h3>
            <p className="text-sm text-white/50 font-medium">Hubungi tim developer untuk kendala teknis atau permintaan fitur baru.</p>
          </div>
          <Link
            href="https://wa.me/6281239551423"
            target="_blank"
            className="shrink-0 flex items-center gap-2 rounded-xl bg-[#D4AF37] px-6 py-3 text-xs font-black text-[#0B213F] hover:brightness-110 transition active:scale-[0.97]"
          >
            <MessageSquare size={15} /> Hubungi Support
            <ExternalLink size={12} />
          </Link>
        </div>
      </div>
    </main>
  );
}
