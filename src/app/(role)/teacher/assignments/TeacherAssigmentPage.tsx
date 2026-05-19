// TeacherAssigmentPage.tsx
import { cookies } from "next/headers";
import { getAuthCookieName, verifyUserJwt } from "@/shared/lib/auth/jwt";
import { getRequestOrigin } from "@/shared/lib/origin";
import BackButton from "@/shared/components/ui/BackButton";
import Link from "next/link";
import { AssignmentsClient } from "./assignments-client";

// 1. Pastikan Type Definition ada
type Course = { id: string; title: string; teachers?: { id: string }[] };
type Assignment = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  course: { id: string; title: string };
  batch?: { id: string; name: string } | null;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt: string;
};

type Batch = { id: string; name: string; courseId: string; isActive: boolean };

// 2. Pastikan fungsi getCourses ini ada di sini (di luar export default)
async function getCourses(baseUrl: string): Promise<Course[]> {
  const response = await fetch(`${baseUrl}/api/courses`, { cache: "no-store" });
  if (!response.ok) return [];
  const data = (await response.json()) as { courses: Course[] };
  return data.courses ?? [];
}

// 3. Pastikan fungsi getAssignments ini juga ada
async function getAssignments(baseUrl: string, token: string): Promise<Assignment[]> {
  const response = await fetch(`${baseUrl}/api/assignments`, {
    cache: "no-store",
    headers: { cookie: `${getAuthCookieName()}=${token}` },
  });
  if (!response.ok) return [];
  const data = (await response.json()) as { assignments: Assignment[] };
  return data.assignments ?? [];
}

async function getBatches(baseUrl: string): Promise<Batch[]> {
  const response = await fetch(`${baseUrl}/api/batches`, { cache: "no-store" });
  if (!response.ok) return [];
  const data = (await response.json()) as { batches: Batch[] };
  return data.batches ?? [];
}

export default async function TeacherAssignmentsPage() {
  const baseUrl = await getRequestOrigin();
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value ?? "";
  const auth = token ? await verifyUserJwt(token).catch(() => null) : null;

  // Baris 31 (lokasi error kamu) sekarang akan mengenali getCourses
  const [courses, assignments, batches] = await Promise.all([
    getCourses(baseUrl),
    getAssignments(baseUrl, token),
    getBatches(baseUrl),
  ]);

  const filteredCourses =
    auth?.role === "TEACHER"
      ? courses.filter((c) => c.teachers?.some(t => t.id === auth.uid))
      : courses;

  return (
    <div className="flex min-h-screen bg-[var(--base)]">
      {/* --- SIDEBAR --- */}
      <aside className="fixed inset-y-0 left-0 z-50 w-72 border-r border-[var(--border)] bg-[var(--base)] p-6 hidden lg:flex flex-col">
        <div className="mb-10 px-2">
          <h2 className="text-2xl font-black tracking-tighter text-[var(--text)]">LMS PANEL</h2>
          <p className="text-xs text-[var(--muted)] font-medium uppercase tracking-widest">Teacher Suite</p>
        </div>

        <nav className="flex-1 space-y-1">
          <Link href="/teacher" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[var(--muted)] hover:bg-black/5 hover:text-[var(--text)] transition-all">
            Dashboard
          </Link>
          <Link href="/teacher/assignments" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-black text-white shadow-lg shadow-black/10 transition-all">
            Kelola Assignment
          </Link>
          <Link href="/teacher/courses" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[var(--muted)] hover:bg-black/5 transition-all">
            Mata Kuliah
          </Link>
        </nav>

        <div className="pt-6 border-t border-[var(--border)]">
          <BackButton />
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 lg:ml-72 min-h-screen transition-all duration-300">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-[var(--text)]">
                Assignments
              </h1>
              <p className="mt-2 text-[var(--muted)]">
                Kelola tugas dengan lampiran materi dan kontrol penuh.
              </p>
            </div>
          </header>

          <div className="rounded-3xl border border-[var(--border)] bg-[var(--base)] p-2">
             <AssignmentsClient
                baseUrl={baseUrl}
                token={token}
                filteredCourses={filteredCourses.map((c) => ({ id: c.id, title: c.title }))}
                batches={batches}
                assignments={assignments}
              />
          </div>
        </div>
      </main>
    </div>
  );
}