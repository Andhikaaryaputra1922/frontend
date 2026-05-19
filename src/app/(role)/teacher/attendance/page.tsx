import { cookies } from "next/headers";
import { getAuthCookieName, verifyUserJwt } from "@/shared/lib/auth/jwt";
import { getRequestOrigin } from "@/shared/lib/origin";
import TeacherAttendanceClient from "./attendance-client";
import TeacherPageLayout from "@/features/users/components/layouts/TeacherPageLayout";

async function getCourses(token: string, baseUrl: string) {
  const res = await fetch(`${baseUrl}/api/courses`, {
    headers: { cookie: `${getAuthCookieName()}=${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.courses || [];
}

async function getBatches(token: string, baseUrl: string) {
  const res = await fetch(`${baseUrl}/api/batches`, {
    headers: { cookie: `${getAuthCookieName()}=${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.batches || [];
}

async function getSchedules(token: string, baseUrl: string) {
  const res = await fetch(`${baseUrl}/api/teacher/schedules`, {
    headers: { cookie: `${getAuthCookieName()}=${token}` },
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.schedules || [];
}

export default async function TeacherAttendancePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value || "";
  const auth = token ? await verifyUserJwt(token).catch(() => null) : null;
  const baseUrl = await getRequestOrigin();

  const [courses, batches, schedules] = await Promise.all([
    getCourses(token, baseUrl),
    getBatches(token, baseUrl),
    getSchedules(token, baseUrl),
  ]);

  const teacherCourses = auth?.role === "TEACHER" 
    ? courses.filter((c: any) => c.teachers?.some((t: any) => t.id === auth.uid))
    : courses;

  return (
    <TeacherPageLayout
      title="Manajemen Presensi"
      subtitle="Kontrol absensi live class, buka/tutup sesi check-in, dan kelola kehadiran siswa per angkatan."
    >
      <TeacherAttendanceClient
        initialSchedules={schedules}
        courses={teacherCourses.map((c: any) => ({ id: c.id, title: c.title }))}
        batches={batches.map((b: any) => ({ id: b.id, name: b.name }))}
      />
    </TeacherPageLayout>
  );
}
