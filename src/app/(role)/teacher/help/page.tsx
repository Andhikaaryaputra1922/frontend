"use client";

import { useState } from "react";
import { 
  Search, LayoutDashboard, CalendarDays, Users, BookOpen, 
  Video, ClipboardList, HelpCircle, ChevronDown, Settings,
  MessageSquare, ExternalLink
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
        question: "Apa yang ditampilkan di Dashboard Guru?",
        answer: "Dashboard menampilkan ringkasan aktivitas mengajar Anda: jumlah kursus aktif, total siswa, jadwal hari ini, tugas yang perlu dinilai, dan statistik kehadiran. Semua informasi penting tersaji dalam satu halaman agar Anda bisa memantau kelas dengan cepat."
      },
      {
        question: "Bagaimana cara membaca statistik di Dashboard?",
        answer: "Setiap kartu statistik menunjukkan angka terkini beserta tren perubahan. Warna hijau menandakan peningkatan, merah menandakan penurunan. Klik pada kartu statistik untuk melihat detail lengkap di halaman terkait."
      },
      {
        question: "Apakah Dashboard otomatis terupdate?",
        answer: "Ya, data di Dashboard diperbarui secara real-time setiap kali Anda membuka halaman. Untuk memperbarui secara manual, cukup refresh halaman browser Anda."
      },
    ],
  },
  {
    id: "schedules",
    icon: <CalendarDays size={18} />,
    title: "Jadwal Mengajar",
    description: "Mengelola jadwal kelas dan sesi pertemuan",
    items: [
      {
        question: "Bagaimana cara melihat jadwal mengajar saya?",
        answer: "Buka menu 'Jadwal' di sidebar. Anda akan melihat daftar semua jadwal mengajar yang telah ditetapkan oleh Admin. Jadwal ditampilkan berdasarkan hari dan waktu, lengkap dengan informasi kursus dan ruang kelas."
      },
      {
        question: "Apakah saya bisa mengubah jadwal mengajar?",
        answer: "Jadwal mengajar ditetapkan oleh Admin. Jika Anda perlu mengubah jadwal, silakan hubungi Admin melalui fitur kontak atau langsung ke halaman pengaturan untuk menemukan informasi kontak Admin."
      },
      {
        question: "Bagaimana jika ada jadwal yang bentrok?",
        answer: "Sistem akan menampilkan peringatan jika ada jadwal yang tumpang tindih. Segera hubungi Admin untuk melakukan penyesuaian jadwal agar tidak terjadi konflik."
      },
    ],
  },
  {
    id: "attendance",
    icon: <Users size={18} />,
    title: "Presensi Siswa",
    description: "Mencatat dan mengelola kehadiran siswa di kelas",
    items: [
      {
        question: "Bagaimana cara mengisi presensi siswa?",
        answer: "Buka menu 'Presensi', pilih kelas dan tanggal pertemuan. Anda akan melihat daftar siswa yang terdaftar. Tandai status kehadiran setiap siswa (Hadir, Izin, Sakit, Alfa), lalu klik 'Simpan Presensi'. Pastikan mengisi presensi di hari yang sama untuk akurasi data."
      },
      {
        question: "Bisakah saya mengedit presensi yang sudah disimpan?",
        answer: "Ya, Anda bisa mengedit presensi yang sudah disimpan selama masih dalam periode yang ditentukan. Buka kembali sesi presensi tersebut, ubah status kehadiran siswa, lalu simpan ulang."
      },
      {
        question: "Bagaimana melihat rekap kehadiran siswa?",
        answer: "Di halaman Presensi, Anda bisa melihat ringkasan kehadiran per siswa dalam bentuk persentase. Data ini membantu Anda mengidentifikasi siswa yang sering absen dan memerlukan perhatian khusus."
      },
    ],
  },
  {
    id: "courses",
    icon: <BookOpen size={18} />,
    title: "Kursus Saya",
    description: "Mengelola kurikulum, bab, dan konten pelajaran",
    items: [
      {
        question: "Bagaimana cara mengelola kursus saya?",
        answer: "Buka menu 'Kursus Saya' untuk melihat semua kursus yang ditugaskan kepada Anda. Klik pada kursus untuk masuk ke halaman detail, di mana Anda bisa mengelola bab (chapter) dan materi pelajaran (lesson) di dalamnya."
      },
      {
        question: "Bagaimana cara menambah bab baru ke kursus?",
        answer: "Di halaman detail kursus, klik tombol 'Tambah Bab'. Isi judul bab dan deskripsi singkat. Bab akan otomatis diurutkan berdasarkan nomor urut yang Anda tentukan. Anda bisa mengubah urutan bab kapan saja."
      },
      {
        question: "Bagaimana cara menambah pelajaran ke dalam bab?",
        answer: "Masuk ke dalam bab yang diinginkan, lalu klik 'Tambah Pelajaran'. Isi judul pelajaran, konten teks, dan lampirkan materi pendukung seperti video atau dokumen. Setiap pelajaran bisa memiliki tipe berbeda: teks, video, atau campuran."
      },
      {
        question: "Apakah siswa langsung bisa mengakses materi yang saya tambahkan?",
        answer: "Ya, materi yang sudah disimpan akan langsung tersedia untuk siswa yang terdaftar di kursus tersebut. Pastikan konten sudah final sebelum menyimpan untuk menghindari kebingungan siswa."
      },
    ],
  },
  {
    id: "recordings",
    icon: <Video size={18} />,
    title: "Rekaman Kelas",
    description: "Upload rekaman pertemuan agar siswa bisa review ulang",
    items: [
      {
        question: "Apa bedanya Rekaman Kelas dengan Kurikulum di Kursus Saya?",
        answer: "Kurikulum (di Kursus Saya → Atur Kurikulum) adalah tempat menyusun materi pembelajaran terstruktur yang bersifat permanen — seperti video tutorial, modul PDF, dan silabus. Sedangkan Rekaman Kelas khusus untuk upload recording pertemuan live (Zoom/Google Meet) per sesi, agar siswa yang berhalangan hadir bisa menonton ulang. Keduanya tersimpan di bab yang sama, tapi tujuan dan konteksnya berbeda."
      },
      {
        question: "Bagaimana cara upload rekaman pertemuan?",
        answer: "Buka menu 'Rekaman Kelas', pilih kursus dan bab yang sesuai, isi judul pertemuan (contoh: 'Pertemuan 5 - 17 Mei 2026'), lalu upload file video atau tempel link YouTube/Google Drive. Anda juga bisa menambahkan catatan ringkasan topik yang dibahas di pertemuan tersebut."
      },
      {
        question: "Format file apa yang didukung?",
        answer: "Video: MP4, WebM, MOV. Anda juga bisa menggunakan link embed dari YouTube atau Google Drive sebagai alternatif upload langsung. Untuk file pendukung, format PDF juga didukung."
      },
      {
        question: "Bisakah saya membatasi rekaman hanya untuk batch tertentu?",
        answer: "Ya! Saat upload, Anda bisa memilih batch/angkatan tertentu. Jika dibiarkan kosong (pilih 'Semua Siswa'), rekaman akan bisa diakses oleh semua siswa di kelas tersebut."
      },
    ],
  },
  {
    id: "assignments",
    icon: <ClipboardList size={18} />,
    title: "Tugas",
    description: "Membuat, menilai, dan mengelola tugas siswa",
    items: [
      {
        question: "Bagaimana cara membuat tugas baru?",
        answer: "Buka menu 'Tugas', lalu klik 'Buat Tugas Baru'. Pilih kursus terkait, isi judul tugas, deskripsi/instruksi, tentukan tenggat waktu, dan skor maksimal. Anda juga bisa melampirkan file referensi jika diperlukan."
      },
      {
        question: "Bagaimana cara menilai tugas siswa?",
        answer: "Di halaman Tugas, klik tugas yang ingin dinilai. Anda akan melihat daftar submission siswa. Klik pada submission untuk melihat jawaban, berikan skor dan feedback tertulis, lalu simpan penilaian. Siswa akan mendapat notifikasi setelah dinilai."
      },
      {
        question: "Bisakah siswa mengumpulkan ulang tugas?",
        answer: "Pengaturan pengumpulan ulang tergantung pada kebijakan yang ditetapkan. Secara default, siswa bisa mengumpulkan tugas sebelum tenggat waktu. Setelah Anda memberikan nilai, siswa bisa melihat feedback untuk perbaikan."
      },
      {
        question: "Bagaimana melihat siapa saja yang belum mengumpulkan?",
        answer: "Di halaman detail tugas, sistem akan menampilkan status pengumpulan setiap siswa: sudah mengumpulkan, belum mengumpulkan, atau terlambat. Anda bisa memfilter berdasarkan status untuk tindak lanjut."
      },
    ],
  },
  {
    id: "quizzes",
    icon: <HelpCircle size={18} />,
    title: "Kuis",
    description: "Membuat dan mengelola kuis untuk evaluasi siswa",
    items: [
      {
        question: "Bagaimana cara membuat kuis?",
        answer: "Buka menu 'Kuis', lalu klik 'Buat Kuis Baru'. Pilih kursus, isi judul dan deskripsi kuis, tentukan durasi pengerjaan, dan tambahkan soal-soal. Anda bisa membuat soal pilihan ganda, essay, atau benar/salah."
      },
      {
        question: "Apakah kuis dinilai otomatis?",
        answer: "Soal pilihan ganda dan benar/salah dinilai secara otomatis oleh sistem. Untuk soal essay, Anda perlu menilai secara manual. Hasil kuis akan ditampilkan setelah semua soal dinilai."
      },
      {
        question: "Bagaimana cara melihat hasil kuis siswa?",
        answer: "Di halaman detail kuis, klik tab 'Hasil'. Anda akan melihat daftar siswa beserta skor mereka. Klik pada nama siswa untuk melihat detail jawaban per soal. Anda juga bisa mengekspor hasil dalam format yang tersedia."
      },
      {
        question: "Bisakah siswa mengulang kuis?",
        answer: "Pengaturan pengulangan kuis bisa diatur saat membuat kuis. Anda bisa mengizinkan siswa mengulang tanpa batas, membatasi jumlah percobaan, atau hanya mengizinkan satu kali percobaan."
      },
    ],
  },
  {
    id: "settings",
    icon: <Settings size={18} />,
    title: "Pengaturan Akun",
    description: "Mengelola profil, password, dan preferensi",
    items: [
      {
        question: "Bagaimana cara mengubah profil saya?",
        answer: "Buka menu 'Pengaturan' di bagian bawah sidebar. Di sana Anda bisa mengubah nama, foto profil, nomor telepon, dan informasi lainnya. Klik 'Simpan' setelah melakukan perubahan."
      },
      {
        question: "Bagaimana cara mengubah password?",
        answer: "Di halaman Pengaturan, cari bagian 'Ganti Password'. Masukkan password lama, password baru, dan konfirmasi password baru. Pastikan password baru memenuhi syarat keamanan minimum (minimal 6 karakter)."
      },
      {
        question: "Bagaimana cara menghubungi Admin?",
        answer: "Anda bisa menghubungi Admin melalui WhatsApp di nomor yang tersedia di halaman Pengaturan, atau langsung melalui tombol 'Hubungi Admin' yang tersedia di beberapa halaman. Admin akan merespons dalam waktu kerja."
      },
    ],
  },
];

export default function TeacherHelpCenterPage() {
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
            Panduan lengkap untuk semua fitur di Panel Pengajar — {totalQuestions} pertanyaan tersedia
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {helpCategories.slice(0, 4).map(cat => (
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
            <h3 className="text-base font-black text-white mb-1">Masih butuh bantuan?</h3>
            <p className="text-sm text-white/50 font-medium">Hubungi Admin Haneen Academy untuk pertanyaan yang tidak tercakup di sini.</p>
          </div>
          <Link
            href="https://wa.me/6281239551423"
            target="_blank"
            className="shrink-0 flex items-center gap-2 rounded-xl bg-[#D4AF37] px-6 py-3 text-xs font-black text-[#0B213F] hover:brightness-110 transition active:scale-[0.97]"
          >
            <MessageSquare size={15} /> Hubungi Admin
            <ExternalLink size={12} />
          </Link>
        </div>
      </div>
    </main>
  );
}
