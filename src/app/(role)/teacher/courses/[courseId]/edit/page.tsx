import { cookies } from "next/headers";
import { getAuthCookieName } from "@/shared/lib/auth/jwt";
import { CourseForm } from "../../course-form";
import { getRequestOrigin } from "@/shared/lib/origin";

async function getCourse(baseUrl: string, courseId: string, token: string) {
  const res = await fetch(`${baseUrl}/api/courses/${courseId}`, {
    cache: "no-store",
    headers: { cookie: `${getAuthCookieName()}=${token}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.course;
}

export default async function EditCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const baseUrl = await getRequestOrigin();
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value ?? "";
  const course = await getCourse(baseUrl, courseId, token);

  if (!course) return <div className="p-20 text-center">Course not found</div>;

  return (
    <main className="min-h-screen bg-[#FDFDFD] px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10">
           <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
              Edit Kursus
           </h1>
           <p className="mt-2 text-sm text-slate-500">
              Perbarui metadata dan pengaturan kursus Anda.
           </p>
        </header>

        <CourseForm initialData={course} courseId={courseId} />
      </div>
    </main>
  );
}
