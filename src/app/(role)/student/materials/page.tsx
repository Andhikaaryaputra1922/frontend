import { cookies } from "next/headers";
import { getAuthCookieName } from "@/shared/lib/auth/jwt";
import BackButton from "@/shared/components/ui/BackButton";
import Link from "next/link";
import { StudentMaterialsClient } from "./materials-client";

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  orderNumber: number;
  type: string;
  contentUrl: string | null;
  youtubeUrl: string | null;
  isDownloadable: boolean;
  createdAt: string;
  courseId: string;
  isLocked: boolean;
};

type Chapter = {
  id: string;
  title: string;
  description: string | null;
  orderNumber: number;
  lessons: Lesson[];
};

type CourseWithChapters = {
  id: string;
  title: string;
  chapters: Chapter[];
  lessonLimit: number | null;
};

async function getPackageGatedMaterials(token: string): Promise<CourseWithChapters[]> {
  const res = await fetch("http://localhost:4000/api/student/materials", {
    cache: "no-store",
    headers: { cookie: `${getAuthCookieName()}=${token}` },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.courses ?? [];
}

export default async function StudentMaterialsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value ?? "";

  const courses = await getPackageGatedMaterials(token);

  return (
    <main className="min-h-screen bg-[var(--base)] px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[var(--text)] md:text-4xl">
              Materi & Rekaman
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Akses materi dan rekaman kelas 24 jam.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <BackButton />
            <Link
              href="/student"
              className="inline-flex rounded-full border border-[var(--border)] bg-[var(--base)]/70 px-5 py-3 text-sm font-semibold text-[var(--text)] hover:bg-black/5"
            >
              Dashboard
            </Link>
          </div>
        </div>

        <StudentMaterialsClient courses={courses} />
      </div>
    </main>
  );
}
