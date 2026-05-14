import { cookies } from "next/headers";
import { getAuthCookieName } from "@/shared/lib/auth/jwt";
import { ContentClient } from "./content-client";
import BackButton from "@/shared/components/ui/BackButton";

async function getCourseContent(courseId: string, token: string) {
  const res = await fetch(`http://localhost:4000/api/courses/${courseId}/chapters`, {
    cache: "no-store",
    headers: { cookie: `${getAuthCookieName()}=${token}` },
  });
  if (!res.ok) return { chapters: [] };
  return res.json();
}

async function getCourseDetails(courseId: string, token: string) {
  const res = await fetch(`http://localhost:4000/api/courses/${courseId}`, {
    cache: "no-store",
    headers: { cookie: `${getAuthCookieName()}=${token}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.course;
}

export default async function CourseContentPage({ params }: { params: { courseId: string } }) {
  const { courseId } = params;
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value ?? "";
  
  const [content, course] = await Promise.all([
    getCourseContent(courseId, token),
    getCourseDetails(courseId, token),
  ]);

  if (!course) return <div className="p-10 text-center">Course not found</div>;

  return (
    <main className="min-h-screen bg-[#FDFDFD] px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <span className="inline-block h-1.5 w-8 rounded-full bg-[#8B0000]" />
               <span className="text-xs font-black uppercase tracking-[0.2em] text-[#8B0000]">Curriculum Builder</span>
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
