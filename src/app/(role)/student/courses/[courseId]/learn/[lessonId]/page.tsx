import { cookies } from "next/headers";
import { getAuthCookieName } from "@/shared/lib/auth/jwt";
import { LearnClient } from "./learn-client";
import { redirect } from "next/navigation";

async function getLessonData(lessonId: string, token: string) {
  const res = await fetch(`http://localhost:4000/api/lessons/${lessonId}`, {
    cache: "no-store",
    headers: { cookie: `${getAuthCookieName()}=${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

async function getCourseSyllabus(courseId: string, token: string) {
  const res = await fetch(`http://localhost:4000/api/courses/${courseId}/chapters`, {
    cache: "no-store",
    headers: { cookie: `${getAuthCookieName()}=${token}` },
  });
  if (!res.ok) return { chapters: [] };
  return res.json();
}

export default async function StudentLearnPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const { courseId, lessonId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value ?? "";

  // If lessonId is "start", we should find the first lesson of the course
  let targetLessonId = lessonId;
  const syllabus = await getCourseSyllabus(courseId, token);


  if (lessonId === "start") {
    let firstLesson = null;
    for (const chapter of syllabus.chapters || []) {
      if (chapter.lessons && chapter.lessons.length > 0) {
        firstLesson = chapter.lessons[0];
        break;
      }
    }

    if (firstLesson) {

      redirect(`/student/courses/${courseId}/learn/${firstLesson.id}`);
    } else {

       return <div className="p-20 text-center">Belum ada materi untuk kursus ini.</div>;
    }
  }

  const lessonRes = await getLessonData(targetLessonId, token);
  if (!lessonRes) return <div className="p-20 text-center">Materi tidak ditemukan atau Anda tidak memiliki akses.</div>;

  return (
    <LearnClient 
      courseId={courseId}
      lesson={lessonRes.lesson}
      initialProgress={lessonRes.progress}
      syllabus={syllabus.chapters || []}
    />
  );
}
