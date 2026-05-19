import { cookies } from "next/headers";
import { getAuthCookieName } from "@/shared/lib/auth/jwt";
import { ContentClient } from "./content-client";
import BackButton from "@/shared/components/ui/BackButton";
import { getRequestOrigin } from "@/shared/lib/origin";

async function getCourseContent(baseUrl: string, courseId: string, token: string) {
  const res = await fetch(`${baseUrl}/api/courses/${courseId}/chapters`, {
    cache: "no-store",
    headers: { cookie: `${getAuthCookieName()}=${token}` },
  });
  if (!res.ok) return { chapters: [] };
  return res.json();
}

async function getCourseDetails(baseUrl: string, courseId: string, token: string) {
  const res = await fetch(`${baseUrl}/api/courses/${courseId}`, {
    cache: "no-store",
    headers: { cookie: `${getAuthCookieName()}=${token}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.course;
}

export default async function CourseContentPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const baseUrl = await getRequestOrigin();
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value ?? "";

  const [content, course] = await Promise.all([
    getCourseContent(baseUrl, courseId, token),
    getCourseDetails(baseUrl, courseId, token),
  ]);

  if (!course) return <div className="p-10 text-center">Course not found</div>;

  return (
    <main className="min-h-screen bg-[#FDFDFD] px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block h-1.5 w-8 rounded-full bg-[#0B213F]" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#0B213F]">Curriculum Builder</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl truncate max-w-[600px]">
              {course.title}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Susun bab dan materi pembelajaran kursus ini.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <BackButton />
          </div>
        </header>

        <ContentClient
          courseId={courseId}
          initialChapters={content.chapters || []}
        />
      </div>
    </main>
  );
}
