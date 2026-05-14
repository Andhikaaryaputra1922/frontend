import Link from "next/link";
import { cookies } from "next/headers";
import { getAuthCookieName } from "@/shared/lib/auth/jwt";
import { getRequestOrigin } from "@/shared/lib/origin";
import { QuizBuilder } from "@/features/courses/components/management/quiz-builder";
import BackButton from "@/shared/components/ui/BackButton";

type Quiz = {
  id: string;
  title: string;
  description?: string | null;
  passScore: number;
  maxAttempts: number;
  isRandomized: boolean;
  timeLimit?: number | null;
  questions: Array<{
    id: string;
    question: string;
    type: string;
    points: number;
    orderNumber: number;
    correctAnswer?: string | null;
    optionsJson?: unknown;
  }>;
  course?: { id: string; title: string };
};

async function getQuiz(baseUrl: string, token: string, quizId: string): Promise<Quiz | null> {
  const response = await fetch(`${baseUrl}/api/quizzes/${quizId}`, {
    cache: "no-store",
    headers: { cookie: `${getAuthCookieName()}=${token}` },
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { quiz: Quiz };
  return data.quiz ?? null;
}

export default async function TeacherQuizBuilderPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  const baseUrl = await getRequestOrigin();
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value ?? "";

  const quiz = await getQuiz(baseUrl, token, quizId);

  if (!quiz) {
    return (
      <main className="min-h-screen bg-[var(--base)] px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-[40px] border border-[var(--border)] bg-[var(--surface)] p-7 md:p-10">
          <p className="text-sm font-semibold text-[var(--muted)]">Quiz tidak ditemukan.</p>
          <Link className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--text)]" href="/teacher/quizzes">
            Kembali
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--base)] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--muted)]">{quiz.course?.title ?? "Course"}</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--text)] md:text-4xl">
              Quiz Builder
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <BackButton />
            <Link
              href={`/teacher/quizzes/${quiz.id}/attempts`}
              className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--text)] hover:bg-black/5"
            >
              Attempts
            </Link>
            <Link
              href="/teacher/quizzes"
              className="inline-flex rounded-full border border-[var(--border)] bg-[var(--base)]/70 px-5 py-3 text-sm font-semibold text-[var(--text)] hover:bg-black/5"
            >
              Kembali
            </Link>
          </div>
        </div>

        <QuizBuilder quiz={quiz} />
      </div>
    </main>
  );
}

