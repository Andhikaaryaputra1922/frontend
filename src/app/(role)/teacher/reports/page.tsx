import Link from "next/link";
import { cookies } from "next/headers";
import { getAuthCookieName, verifyUserJwt } from "@/shared/lib/auth/jwt";
import LogoutButton from "@/shared/components/ui/LogoutButton";
import BackButton from "@/shared/components/ui/BackButton";

export default async function TeacherPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value;
  const auth = token ? await verifyUserJwt(token).catch(() => null) : null;
  const role = auth?.role ?? "UNKNOWN";

  return (
    <main className="min-h-screen bg-[var(--base)] px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-[40px] border border-[var(--border)] bg-[var(--surface)] p-7 md:p-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <BackButton />
              <div>
                <h1 className="text-3xl font-black tracking-tight text-[var(--text)] md:text-4xl">Teacher Dashboard</h1>
                <p className="mt-2 text-sm text-[var(--muted)]">Role: {role}</p>
              </div>
            </div>
            <LogoutButton />
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/teacher/quizzes" className="inline-flex rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-[var(--primary-ink)] hover:brightness-95">Kelola Quiz</Link>
            <Link href="/teacher/assignments" className="inline-flex rounded-full border border-[var(--border)] bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--text)] hover:brightness-[0.98]">Kelola Assignment</Link>
            <Link href="/teacher/materials" className="inline-flex rounded-full border border-[var(--border)] bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--text)] hover:brightness-[0.98]">Materi</Link>
            <Link href="/teacher/attendance" className="inline-flex rounded-full border border-[var(--border)] bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--text)] hover:brightness-[0.98]">Absensi</Link>
            <Link href="/teacher/announcements" className="inline-flex rounded-full border border-[var(--border)] bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--text)] hover:brightness-[0.98]">Pengumuman</Link>
          </div>
        </header>

        <section className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <p className="text-sm font-semibold text-[var(--muted)]">Jumlah Siswa</p>
            <p className="mt-2 text-3xl font-bold text-[var(--primary)]">120</p>
          </div>
          <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <p className="text-sm font-semibold text-[var(--muted)]">Tugas Aktif</p>
            <p className="mt-2 text-3xl font-bold text-[var(--primary)]">15</p>
          </div>
          <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <p className="text-sm font-semibold text-[var(--muted)]">Quiz Aktif</p>
            <p className="mt-2 text-3xl font-bold text-[var(--primary)]">8</p>
          </div>
          <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <p className="text-sm font-semibold text-[var(--muted)]">Total Materi</p>
            <p className="mt-2 text-3xl font-bold text-[var(--primary)]">34</p>
          </div>
          <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <p className="text-sm font-semibold text-[var(--muted)]">Rata-rata Nilai</p>
            <p className="mt-2 text-3xl font-bold text-[var(--primary)]">78.4</p>
          </div>
          <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <p className="text-sm font-semibold text-[var(--muted)]">Tingkat Kehadiran</p>
            <p className="mt-2 text-3xl font-bold text-[var(--primary)]">91%</p>
          </div>
        </section>

        <section className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black tracking-tight text-[var(--text)]">Jadwal Mengajar Hari Ini</h2>
            <Link href="/teacher/schedule" className="text-sm font-semibold text-[var(--primary)] hover:underline">Lihat Semua</Link>
          </div>
          <ul className="mt-4 space-y-3">
            <li className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--base)] px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">Matematika - Kelas 10A</p>
                <p className="text-xs text-[var(--muted)]">08:00 - 09:30 Ruang 101</p>
              </div>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Berlangsung</span>
            </li>
            <li className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--base)] px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">Fisika - Kelas 11B</p>
                <p className="text-xs text-[var(--muted)]">10:00 - 11:30 Ruang 204</p>
              </div>
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">Akan Datang</span>
            </li>
          </ul>
        </section>

        <div className="grid gap-5 md:grid-cols-2">
          <section className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <h2 className="text-lg font-black tracking-tight text-[var(--text)]">Notifikasi</h2>
            <ul className="mt-4 space-y-3">
              <li className="flex gap-3 text-sm text-[var(--muted)]">
                <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-400"></span>
                <span><span className="font-semibold text-[var(--text)]">Quiz Matematika</span> akan berakhir dalam 2 hari.</span>
              </li>
              <li className="flex gap-3 text-sm text-[var(--muted)]">
                <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-yellow-400"></span>
                <span><span className="font-semibold text-[var(--text)]">Tugas Fisika</span> belum dinilai (12 submission).</span>
              </li>
              <li className="flex gap-3 text-sm text-[var(--muted)]">
                <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-blue-400"></span>
                <span><span className="font-semibold text-[var(--text)]">5 siswa</span> mengajukan pertanyaan baru.</span>
              </li>
            </ul>
          </section>
          <section className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <h2 className="text-lg font-black tracking-tight text-[var(--text)]">Aktivitas Terbaru</h2>
            <ul className="mt-4 space-y-3">
              <li className="text-sm text-[var(--muted)]"><span className="font-semibold text-[var(--text)]">Budi Santoso</span> mengumpulkan Tugas Fisika</li>
              <li className="text-sm text-[var(--muted)]"><span className="font-semibold text-[var(--text)]">Ani Rahayu</span> menyelesaikan Quiz Matematika</li>
              <li className="text-sm text-[var(--muted)]"><span className="font-semibold text-[var(--text)]">Reza Pratama</span> mengakses Materi Kimia Bab 3</li>
            </ul>
          </section>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <p className="text-lg font-black tracking-tight text-[var(--text)]">Quiz Builder</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Buat quiz, susun pertanyaan, dan pantau attempt siswa.</p>
            <Link href="/teacher/quizzes" className="mt-5 inline-flex rounded-full border border-[var(--border)] bg-[var(--base)]/70 px-5 py-3 text-sm font-semibold text-[var(--text)] hover:bg-black/5">Buka</Link>
          </div>
          <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <p className="text-lg font-black tracking-tight text-[var(--text)]">Submission dan Grading</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Lihat submission tugas, berikan nilai dan feedback.</p>
            <Link href="/teacher/assignments" className="mt-5 inline-flex rounded-full border border-[var(--border)] bg-[var(--base)]/70 px-5 py-3 text-sm font-semibold text-[var(--text)] hover:bg-black/5">Buka</Link>
          </div>
          <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <p className="text-lg font-black tracking-tight text-[var(--text)]">Manajemen Materi</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Upload modul, video, dan dokumen pembelajaran untuk siswa.</p>
            <Link href="/teacher/materials" className="mt-5 inline-flex rounded-full border border-[var(--border)] bg-[var(--base)]/70 px-5 py-3 text-sm font-semibold text-[var(--text)] hover:bg-black/5">Buka</Link>
          </div>
          <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <p className="text-lg font-black tracking-tight text-[var(--text)]">Absensi Siswa</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Catat kehadiran siswa per sesi dan lihat rekap absensi.</p>
            <Link href="/teacher/attendance" className="mt-5 inline-flex rounded-full border border-[var(--border)] bg-[var(--base)]/70 px-5 py-3 text-sm font-semibold text-[var(--text)] hover:bg-black/5">Buka</Link>
          </div>
          <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <p className="text-lg font-black tracking-tight text-[var(--text)]">Laporan dan Progress Siswa</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Pantau perkembangan belajar, nilai, dan analitik per siswa.</p>
            <Link href="/teacher/reports" className="mt-5 inline-flex rounded-full border border-[var(--border)] bg-[var(--base)]/70 px-5 py-3 text-sm font-semibold text-[var(--text)] hover:bg-black/5">Buka</Link>
          </div>
          <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <p className="text-lg font-black tracking-tight text-[var(--text)]">Pengumuman</p>
            <p className="mt-2 text-sm text-[var(--muted)]">Kirim pengumuman ke seluruh kelas atau siswa tertentu.</p>
            <Link href="/teacher/announcements" className="mt-5 inline-flex rounded-full border border-[var(--border)] bg-[var(--base)]/70 px-5 py-3 text-sm font-semibold text-[var(--text)] hover:bg-black/5">Buka</Link>
          </div>
        </div>
      </div>
    </main>
  );
}