import { cookies } from "next/headers";
import { getAuthCookieName, verifyUserJwt } from "@/shared/lib/auth/jwt";
import { getRequestOrigin } from "@/shared/lib/origin";

type Course = { id: string; title: string; teacher?: { id: string } | null };
type Assignment = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  course: { id: string; title: string };
};

async function getCourses(baseUrl: string): Promise<Course[]> {
  const response = await fetch(`${baseUrl}/api/courses`, { cache: "no-store" });
  if (!response.ok) return [];
  const data = (await response.json()) as { courses: Course[] };
  return data.courses ?? [];
}

async function getAssignments(baseUrl: string, token: string): Promise<Assignment[]> {
  const response = await fetch(`${baseUrl}/api/assignments`, {
    cache: "no-store",
    headers: { cookie: `${getAuthCookieName()}=${token}` },
  });
  if (!response.ok) return [];
  const data = (await response.json()) as { assignments: Assignment[] };
  return data.assignments ?? [];
}

export async function getTeacherAssignmentsData() {
  const baseUrl = await getRequestOrigin();
  const cookieStore = await cookies(); // ✅ await di sini
  const token = cookieStore.get(getAuthCookieName())?.value ?? "";
  const auth = token ? await verifyUserJwt(token).catch(() => null) : null;

  const [courses, assignments] = await Promise.all([
    getCourses(baseUrl),
    getAssignments(baseUrl, token),
  ]);

  const filteredCourses =
    auth?.role === "TEACHER"
      ? courses.filter((c) => c.teacher?.id === auth.uid)
      : courses;

  return { filteredCourses, assignments, baseUrl, token };
}
