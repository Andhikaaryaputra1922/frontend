import { cookies } from "next/headers";
import { getAuthCookieName, verifyUserJwt } from "@/lib/auth/jwt";
import BackButton from "@/components/BackButton";
import Link from "next/link";
import { AssignmentsClient } from "./assignments-client";

type Course = { id: string; title: string; teacherId: string };
type Assignment = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  course: { id: string; title: string };
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

async function getAssignments(token: string): Promise<Assignment[]> {
  const response = await fetch("http://localhost:4000/api/assignments", {
    cache: "no-store",
    headers: { cookie: `${getAuthCookieName()}=${token}` },
  });
  if (!response.ok) return [];
  const data = (await response.json()) as { assignments: Assignment[] };
  return data.assignments ?? [];
}

export default async function TeacherAssignmentsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value ?? "";
  const auth = token ? await verifyUserJwt(token).catch(() => null) : null;

  const [allCourses, assignments] = await Promise.all([
    getCourses(token),
    getAssignments(token),
  ]);

  const filteredCourses = auth?.role === "TEACHER"
    ? allCourses.filter((c) => c.teacherId === auth.uid)
    : allCourses;

  return (
    <main className="min-h-screen bg-[var(--base)] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[var(--text)] md:text-4xl">
              Kelola Assignment
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Buat tugas, lihat submission, dan beri nilai.
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

        <AssignmentsClient
          filteredCourses={filteredCourses.map((c) => ({ id: c.id, title: c.title }))}
          assignments={assignments}
        />
      </div>
    </main>
  );
}
