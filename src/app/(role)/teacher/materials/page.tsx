import { cookies } from "next/headers";
import { getAuthCookieName, verifyUserJwt } from "@/shared/lib/auth/jwt";
import BackButton from "@/shared/components/ui/BackButton";
import Link from "next/link";
import { MaterialsClient } from "./materials-client";

type Course = { id: string; title: string; teacherId: string };
type Lesson = {
  id: string;
  title: string;
  description: string | null;
  orderNumber: number;
  type: string;
  attachmentUrl: string | null;
  videoUrl: string | null;
  createdAt: string;
};

async function getCourses(token: string): Promise<Course[]> {
  const response = await fetch("http://localhost:4000/api/courses", {
    cache: "no-store",
    headers: { cookie: `${getAuthCookieName()}=${token}` },
  });
  if (!response.ok) return [];
  const data = (await response.json()) as { courses: Course[] };
  return data.courses ?? [];
}

async function getLessons(courseId: string, token: string): Promise<Lesson[]> {
  const url = `http://localhost:4000/api/courses/${courseId}/chapters`;
  const response = await fetch(url, {
    cache: "no-store",
    headers: { cookie: `${getAuthCookieName()}=${token}` },
  });
  
  if (!response.ok) {
    console.error(`[getLessons] Failed to fetch chapters for ${courseId}: ${response.status} ${response.statusText}`);
    return [];
  }
  
  const data = (await response.json()) as { chapters: any[] };
  console.log(`[getLessons] Fetched ${data.chapters?.length || 0} chapters for course ${courseId}`);
  
  const allLessons: Lesson[] = [];
  data.chapters?.forEach((ch) => {
    ch.lessons?.forEach((ls: any) => {
      allLessons.push({
        id: ls.id,
        title: ls.title,
        description: ls.description,
        orderNumber: ls.orderNumber,
        type: ls.type,
        attachmentUrl: ls.attachmentUrl,
        videoUrl: ls.videoUrl,
        createdAt: ls.createdAt,
      } as any);
    });
  });
  
  console.log(`[getLessons] Total flattened lessons for ${courseId}: ${allLessons.length}`);
  return allLessons;
}

export default async function MaterialsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value ?? "";
  const auth = token ? await verifyUserJwt(token).catch(() => null) : null;

  const allCourses = await getCourses(token);
  const teacherCourses = auth?.role === "TEACHER"
    ? allCourses.filter((c: any) => c.teachers?.some((t: any) => t.id === auth.uid))
    : allCourses;

  // Ambil semua lessons dari semua course milik teacher
  const lessonsPerCourse = await Promise.all(
    teacherCourses.map(async (c) => ({
      course: c,
      lessons: await getLessons(c.id, token),
    }))
  );

  return (
    <main className="min-h-screen bg-[var(--base)] px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[var(--text)] md:text-4xl">
              Manajemen Materi
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Upload rekaman dan materi per kelas ke dalam bab kurikulum.
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

        <MaterialsClient
          courses={teacherCourses.map((c) => ({ id: c.id, title: c.title }))}
          lessonsPerCourse={lessonsPerCourse.map((lpc) => ({
            courseId: lpc.course.id,
            courseTitle: lpc.course.title,
            lessons: lpc.lessons,
          }))}
        />
      </div>
    </main>
  );
}
