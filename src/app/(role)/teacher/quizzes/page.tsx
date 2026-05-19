import Link from "next/link";
import { cookies } from "next/headers";
import { getAuthCookieName, verifyUserJwt } from "@/shared/lib/auth/jwt";
import { getRequestOrigin } from "@/shared/lib/origin";
import { QuizzesManager } from "@/features/courses/components/management/quizzes-manager";
import TeacherPageLayout from "@/features/users/components/layouts/TeacherPageLayout";

type Course = { id: string; title: string; teachers?: { id: string }[] };

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

  async function getBatches(baseUrl: string, token: string, courseIds: string[]): Promise<any[]> {
    if (!courseIds.length) return [];
    const results = await Promise.all(
      courseIds.map((cId) =>
        fetch(`${baseUrl}/api/batches?courseId=${cId}`, {
          cache: "no-store",
          headers: { cookie: `${getAuthCookieName()}=${token}` },
        }).then((r) => r.ok ? r.json().then((d: { batches: any[] }) => (d.batches ?? []).map(b => ({ ...b, courseId: cId }))) : [])
      )
    );
    return results.flat();
  }

  const courses = await getCourses(baseUrl);
  const filteredCourses = auth?.role === "TEACHER" ? courses.filter((c) => c.teachers?.some(t => t.id === auth.uid)) : courses;
  
  const [quizzes, batches] = await Promise.all([
    getQuizzes(baseUrl, token),
    getBatches(baseUrl, token, filteredCourses.map((c) => c.id))
  ]);

  return (
    <TeacherPageLayout
      title="Kelola Quiz"
      subtitle="Buat quiz, susun pertanyaan, dan pantau attempt siswa."
    >
      <QuizzesManager
        basePath="/teacher"
        courses={filteredCourses.map((c) => ({ id: c.id, title: c.title }))}
        batches={batches}
        quizzes={quizzes}
      />
    </TeacherPageLayout>
  );
}

