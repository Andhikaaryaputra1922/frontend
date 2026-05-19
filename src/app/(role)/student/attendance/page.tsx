import { cookies } from "next/headers";
import { getAuthCookieName, verifyUserJwt } from "@/shared/lib/auth/jwt";
import { getRequestOrigin } from "@/shared/lib/origin";
import StudentAttendanceClient from "./attendance-client";
import BackButton from "@/shared/components/ui/BackButton";

async function getTodaySessions(token: string, baseUrl: string) {
  const res = await fetch(`${baseUrl}/api/student/attendance/today`, {
    headers: { cookie: `${getAuthCookieName()}=${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.sessions || [];
}

async function getHistory(token: string, baseUrl: string) {
  const res = await fetch(`${baseUrl}/api/student/attendance/history`, {
    headers: { cookie: `${getAuthCookieName()}=${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.history || [];
}

export default async function StudentAttendancePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value || "";
  const baseUrl = await getRequestOrigin();

  const [todaySessions, history] = await Promise.all([
    getTodaySessions(token, baseUrl),
    getHistory(token, baseUrl),
  ]);

  return (
    <main className="min-h-screen bg-slate-50/50 p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-1.5 bg-[#8B0000] rounded-full" />
              <h1 className="text-4xl font-black tracking-tight text-[#0B213F] uppercase">
                Presensi <span className="text-[#8B0000]">Siswa</span>
              </h1>
            </div>
            <p className="text-sm font-medium text-slate-500 max-w-md">
              Lakukan check-in saat kelas berlangsung dan pantau riwayat kehadiran Anda.
            </p>
          </div>
          <BackButton />
        </header>

        <StudentAttendanceClient 
          initialSessions={todaySessions}
          initialHistory={history}
        />
      </div>
    </main>
  );
}
