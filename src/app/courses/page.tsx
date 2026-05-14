import Link from "next/link";
import { getRequestOrigin } from "@/shared/lib/origin";
import { ArrowUpRight, Search } from "lucide-react";
import { cookies } from "next/headers";
import { getAuthCookieName, verifyUserJwt } from "@/shared/lib/auth/jwt";
import { EnrollButton } from "@/features/packages/components/enroll-button";

async function getCourses() {
  const baseUrl = await getRequestOrigin();
  const response = await fetch(`${baseUrl}/api/courses`, { cache: "no-store" });
  if (!response.ok) return [];
  const data = (await response.json()) as { courses: Array<Record<string, unknown>> };
  return data.courses;
}

export default async function CoursesPage() {
  const courses = await getCourses();
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value;
  const auth = token ? await verifyUserJwt(token).catch(() => null) : null;

  const enrolledCourseIds = new Set<string>();
  if (auth?.role === "STUDENT" && token) {
    const baseUrl = await getRequestOrigin();
    const response = await fetch(`${baseUrl}/api/enrollments`, {
      cache: "no-store",
      headers: { cookie: `${getAuthCookieName()}=${token}` },
    });
    if (response.ok) {
      const data = (await response.json()) as {
        enrollments: Array<{ courseId?: string; course?: { id: string } }>;
      };
      for (const e of data.enrollments ?? []) {
        const courseId = e.courseId ?? e.course?.id;
        if (courseId) enrolledCourseIds.add(String(courseId));
      }
    }
  }

  return (
    <main className="min-h-screen bg-[var(--base)] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 rounded-[40px] border border-[var(--border)] bg-[var(--surface)] p-7 md:flex-row md:items-center md:justify-between md:p-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[var(--text)] md:text-4xl">
              Courses
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Jelajahi course dan pantau informasi kategori/level.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--base)]/70 px-4 py-3 text-sm">
              <Search size={18} className="text-[var(--muted)]" />
              <input
                className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--muted)]"
                placeholder="Cari course…"
              />
            </div>

            <Link
              href="/admin"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--text)] hover:brightness-[0.98]"
            >
              Admin panel
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--text)] text-[var(--primary-ink)]">
                <ArrowUpRight size={18} />
              </span>
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {courses.length > 0 ? (
            courses.map((course) => (
              <div
                key={String(course.id)}
                className="group rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-5 overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--primary)]/10 p-5">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-[var(--text)]">
                    {String(course.category)}
                  </div>
                  <p className="mt-3 text-xs font-semibold text-[var(--muted)]">
                    Level: {String(course.level)}
                  </p>
                </div>

                <h3 className="text-lg font-black tracking-tight text-[var(--text)]">
                  {String(course.title)}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--muted)]">
                  {String(course.description)}
                </p>

                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--muted)]">
                    Updated recently
                  </span>

                  {auth?.role === "STUDENT" ? (
                    <EnrollButton courseId={String(course.id)} disabled={enrolledCourseIds.has(String(course.id))} />
                  ) : (
                    <Link
                      href="/dashboard/enrollments"
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--base)]/70 px-4 py-2 text-xs font-semibold text-[var(--text)] hover:bg-black/5"
                    >
                      Manage
                      <ArrowUpRight size={16} />
                    </Link>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[32px] border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)] md:col-span-2 xl:col-span-3">
              Belum ada course. Buat course pertama lewat API `POST /api/courses`.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
