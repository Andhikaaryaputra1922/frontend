import StudentSettingsClient from "@/features/users/components/student/StudentSettingsClient";

export default function StudentSettingsPage() {
  return (
    <main className="min-h-screen bg-[var(--base)] px-6 py-10 md:py-16">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block h-1.5 w-8 rounded-full bg-[#8B0000]" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#8B0000]">Akun Saya</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[var(--text)] md:text-5xl">
            Pengaturan
          </h1>
        </header>

        <StudentSettingsClient />
      </div>
    </main>
  );
}

