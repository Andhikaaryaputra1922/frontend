import Link from "next/link";
import { cookies } from "next/headers";
import { getAuthCookieName } from "@/shared/lib/auth/jwt";
import { getRequestOrigin } from "@/shared/lib/origin";
import { QuizTake, type QuizQuestion } from "@/features/courses/components/quiz-take";
import BackButton from "@/shared/components/ui/BackButton";

type Quiz = {
  id: string;
  title: string;
  description?: string | null;
  questions: QuizQuestion[];
  course?: { id: string; title: string };
};

async function getQuiz(quizId: string): Promise<Quiz | null> {
  const baseUrl = await getRequestOrigin();
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value;

  const response = await fetch(`${baseUrl}/api/quizzes/${quizId}`, {
    cache: "no-store",
    headers: token ? { cookie: `${getAuthCookieName()}=${token}` } : undefined,
  });

  if (!response.ok) return null;
  const data = (await response.json()) as { quiz: Quiz };
  return data.quiz ?? null;
}

export default async function StudentQuizDetailPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  const quiz = await getQuiz(quizId);

  if (!quiz) {
    return (
      <main className="min-h-screen bg-[var(--base)] px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-[40px] border border-[var(--border)] bg-[var(--surface)] p-7 md:p-10">
          <p className="text-sm font-semibold text-[var(--muted)]">Quiz tidak ditemukan.</p>
          <Link className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--text)]" href="/student/quizzes">
            Kembali
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--base)] px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[40px] border border-[var(--border)] bg-[var(--surface)] p-7 md:p-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-[var(--text)] md:text-4xl">
                {quiz.title}
              </h1>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {quiz.course?.title ?? "Course"}
              </p>
              {quiz.description ? (
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  {quiz.description}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              <BackButton />
              <Link
                href="/student/quizzes"
                className="rounded-full border border-[var(--border)] bg-[var(--base)]/70 px-5 py-3 text-sm font-semibold text-[var(--text)] hover:bg-black/5"
              >
                Back
              </Link>
            </div>
          </div>

          <div className="mt-8">
            <QuizTake quizId={quiz.id} questions={quiz.questions} />
          </div>
        </div>
      </div>
    </main>
  );
}

