import Link from "next/link";
import { cookies } from "next/headers";
import { getAuthCookieName, verifyUserJwt } from "@/shared/lib/auth/jwt";
import { getRequestOrigin } from "@/shared/lib/origin";
import { CompleteEnrollmentButton } from "@/features/packages/components/complete-enrollment-button";
import BackButton from "@/shared/components/ui/BackButton";

type Enrollment = {
  id: string;
  status: string;
  progress: number;
  course: { id: string; title: string; slug: string };
};

async function getEnrollments(): Promise<{ enrollments: Enrollment[]; role: string }> {
  const baseUrl = await getRequestOrigin();
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value;

  const auth = token ? await verifyUserJwt(token).catch(() => null) : null;

  const response = await fetch(`${baseUrl}/api/enrollments`, {
    cache: "no-store",
    headers: token ? { cookie: `${getAuthCookieName()}=${token}` } : undefined,
  });

  if (!response.ok) return { enrollments: [], role: auth?.role ?? "UNKNOWN" };
  const data = (await response.json()) as { enrollments: Enrollment[] };
  return { enrollments: data.enrollments ?? [], role: auth?.role ?? "UNKNOWN" };
}

export default async function StudentEnrollmentsPage() {
  const { enrollments, role } = await getEnrollments();

  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[40px] border border-[var(--border)] bg-white p-7 md:p-10 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-[var(--text)] md:text-4xl">
                Kelas Saya
              </h1>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Daftar kelas yang sedang/akan kamu ikuti.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <BackButton />
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--text)] hover:brightness-[0.98]"
              >
                Browse courses
              </Link>
              <Link
                href="/student"
                className="inline-flex rounded-full border border-[var(--border)] bg-[var(--base)]/70 px-5 py-3 text-sm font-semibold text-[var(--text)] hover:bg-black/5"
              >
                Dashboard
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-5">
            {enrollments.length > 0 ? (
              enrollments.map((e) => (
                <div
                  key={e.id}
                  className="rounded-[32px] border border-[var(--border)] bg-[var(--base)]/70 p-6"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-lg font-black tracking-tight text-[var(--text)]">
                        {e.course.title}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-[var(--muted)]">
                        Status: {e.status} • Progress: {Math.round(e.progress)}%
                      </p>
                    </div>
                    {role === "STUDENT" && (
                      <div className="flex flex-col sm:flex-row gap-3">
                         <Link 
                            href={`/student/courses/${e.course.id}`}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#1A2E44] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#E5B54F] hover:text-[#1A2E44] transition-all shadow-lg shadow-[#1A2E44]/10"
                         >
                            Mulai Belajar
                         </Link>
                         {e.status !== "COMPLETED" && (
                            <CompleteEnrollmentButton enrollmentId={e.id} />
                         )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[32px] border border-dashed border-[var(--border)] bg-[var(--base)]/70 p-8 text-[var(--muted)]">
                Belum ada kelas yang kamu ikuti.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

