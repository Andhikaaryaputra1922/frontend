import Link from "next/link";
import { cookies } from "next/headers";
import { getAuthCookieName, verifyUserJwt } from "@/shared/lib/auth/jwt";
import { getRequestOrigin } from "@/shared/lib/origin";
import { QuizzesManager } from "@/features/courses/components/management/quizzes-manager";
import BackButton from "@/shared/components/ui/BackButton";

type Course = { id: string; title: string; teacher?: { id: string } | null };

type Quiz = {
  id: string;
  title: string;
  description?: string | null;
  passScore: number;
  maxAttempts: number;
  isRandomized: boolean;
  timeLimit?: number | null;
  course: { id: string; title: string };
};

async function getCourses(baseUrl: string): Promise<Course[]> {
  const response = await fetch(`${baseUrl}/api/courses`, { cache: "no-store" });
  if (!response.ok) return [];
  const data = (await response.json()) as { courses: Course[] };
  return data.courses ?? [];
}

async function getQuizzes(baseUrl: string, token: string): Promise<Quiz[]> {
  const response = await fetch(`${baseUrl}/api/quizzes`, {
    cache: "no-store",
    headers: { cookie: `${getAuthCookieName()}=${token}` },
  });
  if (!response.ok) return [];
  const data = (await response.json()) as { quizzes: Quiz[] };
  return data.quizzes ?? [];
}

export default async function TeacherQuizzesPage() {
  const baseUrl = await getRequestOrigin();
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value ?? "";
  const auth = token ? await verifyUserJwt(token).catch(() => null) : null;

  const [courses, quizzes] = await Promise.all([getCourses(baseUrl), getQuizzes(baseUrl, token)]);
  const filteredCourses =
    auth?.role === "TEACHER" ? courses.filter((c) => c.teacher?.id === auth.uid) : courses;

  return (
    <main className="min-h-screen bg-[var(--base)] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[var(--text)] md:text-4xl">
              Kelola Quiz
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Buat quiz, susun pertanyaan, dan pantau attempt siswa.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <BackButton />
            <Link
              href="/teacher"
              className="inline-flex rounded-full border border-[var(--border)] bg-[var(--base)]/70 px-5 py-3 text-sm font-semibold text-[var(--text)] hover:bg-black/5"
            >
              Dashboard
            </Link>
          </div>
        </div>

        <QuizzesManager
          basePath="/teacher"
          courses={filteredCourses.map((c) => ({ id: c.id, title: c.title }))}
          quizzes={quizzes}
        />
      </div>
    </main>
  );
}

