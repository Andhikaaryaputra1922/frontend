import Link from "next/link";
import { cookies } from "next/headers";
import { getAuthCookieName } from "@/shared/lib/auth/jwt";
import { getRequestOrigin } from "@/shared/lib/origin";
import BackButton from "@/shared/components/ui/BackButton";

type Attempt = {
  id: string;
  startedAt: string;
  submittedAt?: string | null;
  score?: number | null;
  student: { id: string; name?: string | null; email: string };
};

type QuizSummary = { id: string; title: string };

async function getAttempts(baseUrl: string, token: string, quizId: string): Promise<{ quiz: QuizSummary; attempts: Attempt[] } | null> {
  const response = await fetch(`${baseUrl}/api/quizzes/${quizId}/attempts`, {
    cache: "no-store",
    headers: { cookie: `${getAuthCookieName()}=${token}` },
  });
  if (!response.ok) return null;
  return (await response.json()) as { quiz: QuizSummary; attempts: Attempt[] };
}

export default async function TeacherQuizAttemptsPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  const baseUrl = await getRequestOrigin();
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value ?? "";

  const data = await getAttempts(baseUrl, token, quizId);

  if (!data) {
    return (
      <main className="min-h-screen bg-[var(--base)] px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-[40px] border border-[var(--border)] bg-[var(--surface)] p-7 md:p-10">
          <p className="text-sm font-semibold text-[var(--muted)]">Data attempt tidak ditemukan.</p>
          <Link className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--text)]" href="/teacher/quizzes">
            Kembali
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--base)] px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[40px] border border-[var(--border)] bg-[var(--surface)] p-7 md:p-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-[var(--text)] md:text-4xl">
                Attempts
              </h1>
              <p className="mt-2 text-sm text-[var(--muted)]">{data.quiz.title}</p>
            </div>
            <div className="flex items-center gap-3">
              <BackButton />
              <Link
                href={`/teacher/quizzes/${quizId}`}
                className="inline-flex rounded-full border border-[var(--border)] bg-[var(--base)]/70 px-5 py-3 text-sm font-semibold text-[var(--text)] hover:bg-black/5"
              >
                Builder
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4">
            {data.attempts.length > 0 ? (
              data.attempts.map((a) => (
                <div key={a.id} className="rounded-[28px] border border-[var(--border)] bg-[var(--base)]/70 p-5">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-black text-[var(--text)]">{a.student.name ?? a.student.email}</p>
                      <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                        {new Date(a.startedAt).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
                      <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1">
                        Score: {typeof a.score === "number" ? Math.round(a.score) : "-"}
                      </span>
                      <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1">
                        Submitted: {a.submittedAt ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[28px] border border-dashed border-[var(--border)] bg-[var(--base)]/70 p-6 text-sm text-[var(--muted)]">
                Belum ada attempt.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

