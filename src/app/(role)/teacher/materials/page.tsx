import { cookies } from "next/headers";
import { getAuthCookieName, verifyUserJwt } from "@/shared/lib/auth/jwt";
import { RecordingsClient } from "./materials-client";
import { getRequestOrigin } from "@/shared/lib/origin";
import TeacherPageLayout from "@/features/users/components/layouts/TeacherPageLayout";

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
  
  if (!response.ok) return [];
  
  const data = (await response.json()) as { chapters: any[] };
  
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
  
  return allLessons;
}

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

export default async function RecordingsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value ?? "";
  const auth = token ? await verifyUserJwt(token).catch(() => null) : null;

  const baseUrl = await getRequestOrigin();
  const allCourses = await getCourses(token);
  const teacherCourses = auth?.role === "TEACHER"
    ? allCourses.filter((c: any) => c.teachers?.some((t: any) => t.id === auth.uid))
    : allCourses;
  const batches = await getBatches(baseUrl, token, teacherCourses.map((c) => c.id));

  const lessonsPerCourse = await Promise.all(
    teacherCourses.map(async (c) => ({
      course: c,
      lessons: await getLessons(c.id, token),
    }))
  );

  return (
    <TeacherPageLayout
      title="Rekaman Kelas"
      subtitle="Upload rekaman pertemuan kelas agar siswa bisa review ulang materi yang terlewat."
    >
      <RecordingsClient
        courses={teacherCourses.map((c) => ({ id: c.id, title: c.title }))}
        batches={batches}
        lessonsPerCourse={lessonsPerCourse.map((lpc) => ({
          courseId: lpc.course.id,
          courseTitle: lpc.course.title,
          lessons: lpc.lessons,
        }))}
      />
    </TeacherPageLayout>
  );
}
