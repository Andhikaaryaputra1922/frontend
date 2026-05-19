import { cookies } from "next/headers";
import { getAuthCookieName, verifyUserJwt } from "@/shared/lib/auth/jwt";
import Link from "next/link";
import { AssignmentsClient } from "./assignments-client";
import TeacherPageLayout from "@/features/users/components/layouts/TeacherPageLayout";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

type Batch = { id: string; name: string; courseId: string; isActive: boolean };
type Course = { id: string; title: string; teachers: { id: string }[] };
type Assignment = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  course: { id: string; title: string };
  batch?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
};

async function getCourses(token: string): Promise<Course[]> {
  const response = await fetch(`${BACKEND_URL}/api/courses`, {
    cache: "no-store",
    headers: { cookie: `${getAuthCookieName()}=${token}` },
  });
  if (!response.ok) return [];
  const data = (await response.json()) as { courses: Course[] };
  return data.courses ?? [];
}

async function getBatches(token: string, courseIds: string[]): Promise<Batch[]> {
  if (!courseIds.length) return [];
  const results = await Promise.all(
    courseIds.map((cId) =>
      fetch(`${BACKEND_URL}/api/batches?courseId=${cId}`, {
        cache: "no-store",
        headers: { cookie: `${getAuthCookieName()}=${token}` },
      }).then((r) => r.ok ? r.json().then((d: { batches: Batch[] }) => (d.batches ?? []).map(b => ({ ...b, courseId: cId }))) : [])
    )
  );
  return results.flat();
}

async function getAssignments(token: string): Promise<Assignment[]> {
  const response = await fetch(`${BACKEND_URL}/api/assignments`, {
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
    ? allCourses.filter((c: any) => c.teachers?.some((t: any) => t.id === auth.uid))
    : allCourses;

  const batches = await getBatches(token, filteredCourses.map((c) => c.id));

  return (
    <TeacherPageLayout
      title="Kelola Tugas"
      subtitle="Buat tugas per batch, lihat submission, dan beri nilai."
    >
      <AssignmentsClient
        baseUrl={BACKEND_URL}
        token={token}
        filteredCourses={filteredCourses.map((c) => ({ id: c.id, title: c.title }))}
        batches={batches}
        assignments={assignments}
      />
    </TeacherPageLayout>
  );
}
