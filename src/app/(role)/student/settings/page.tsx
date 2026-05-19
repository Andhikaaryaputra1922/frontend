import StudentSettingsClient from "@/features/users/components/student/StudentSettingsClient";

export default function StudentSettingsPage() {
  return (
    <main className="min-h-screen bg-[var(--base)] px-6 py-10 md:py-16">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10">
          <h1 className="text-3xl font-black tracking-tight text-[var(--text)] md:text-4xl">
            Pengaturan
          </h1>
          <p className="mt-2 text-sm font-medium text-[var(--muted)]">
            Kelola profil, keamanan, dan preferensi akun Anda
          </p>
        </header>

        <StudentSettingsClient />
      </div>
    </main>
  );
}
