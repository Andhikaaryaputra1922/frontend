export default function AnnouncementsPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="mx-auto max-w-6xl px-6 md:px-10 py-8">
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Pengajar</p>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B213F]">Pengumuman</h1>
          <p className="mt-1 text-sm text-slate-400">Kirim pengumuman kepada siswa di kursus Anda.</p>
        </div>
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-slate-200">
          <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <p className="text-sm font-bold text-slate-500">Segera Hadir</p>
          <p className="text-xs text-slate-400 mt-1">Fitur pengumuman sedang dalam pengembangan.</p>
        </div>
      </div>
    </main>
  );
}
