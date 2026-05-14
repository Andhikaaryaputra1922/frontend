import Link from "next/link";
import { cookies } from "next/headers";
import { getAuthCookieName } from "@/shared/lib/auth/jwt";
import { getRequestOrigin } from "@/shared/lib/origin";
import BackButton from "@/shared/components/ui/BackButton";

type Quiz = {
  id: string;
  title: string;
  description?: string | null;
  passScore: number;
  maxAttempts: number;
  course: { id: string; title: string };
};

async function getQuizzes(): Promise<Quiz[]> {
  const baseUrl = await getRequestOrigin();
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value;

  const response = await fetch(`${baseUrl}/api/quizzes`, {
    cache: "no-store",
    headers: token ? { cookie: `${getAuthCookieName()}=${token}` } : undefined,
  });

  if (!response.ok) return [];
  const data = (await response.json()) as { quizzes: Quiz[] };
  return data.quizzes ?? [];
}

export default async function StudentQuizzesPage() {
  const quizzes = await getQuizzes();

  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[40px] border border-[var(--border)] bg-white p-7 md:p-10 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-[var(--text)] md:text-4xl">
                Quizzes
              </h1>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Kerjakan quiz yang tersedia dan lihat hasilnya.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <BackButton />
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {quizzes.length > 0 ? (
              quizzes.map((q) => (
                <Link
                  key={q.id}
                  href={`/student/quizzes/${q.id}`}
                  className="rounded-[32px] border border-[var(--border)] bg-slate-50/50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <p className="text-lg font-black tracking-tight text-[var(--text)]">
                    {q.title}
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {q.course?.title ?? "Course"}
                  </p>
                  {q.description ? (
                    <p className="mt-3 line-clamp-2 text-sm text-[var(--muted)]">
                      {q.description}
                    </p>
                  ) : null}
                  <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-[var(--muted)]">
                    <span className="rounded-full border border-[var(--border)] bg-white px-3 py-1">
                      Pass: {q.passScore}
                    </span>
                    <span className="rounded-full border border-[var(--border)] bg-white px-3 py-1">
                      Attempts: {q.maxAttempts}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-[32px] border border-dashed border-[var(--border)] bg-slate-50/50 p-8 text-[var(--muted)] md:col-span-2">
                Belum ada quiz.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

