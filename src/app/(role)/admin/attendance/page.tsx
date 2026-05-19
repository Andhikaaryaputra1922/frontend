import { cookies } from "next/headers";
import { getAuthCookieName, verifyUserJwt } from "@/shared/lib/auth/jwt";
import { getRequestOrigin } from "@/shared/lib/origin";
import AdminPageLayout from "@/features/users/components/layouts/AdminPageLayout";
import AdminAttendanceClient from "./admin-client";

async function getAllData(token: string, baseUrl: string) {
  const [attRes, batchRes, courseRes] = await Promise.all([
    fetch(`${baseUrl}/api/admin/attendance/all`, { headers: { cookie: `${getAuthCookieName()}=${token}` }, cache: "no-store" }),
    fetch(`${baseUrl}/api/batches`, { headers: { cookie: `${getAuthCookieName()}=${token}` }, cache: "no-store" }),
    fetch(`${baseUrl}/api/courses`, { headers: { cookie: `${getAuthCookieName()}=${token}` }, cache: "no-store" }),
  ]);

  const [att, batch, course] = await Promise.all([
    attRes.ok ? attRes.json() : { attendances: [] },
    batchRes.ok ? batchRes.json() : { batches: [] },
    courseRes.ok ? courseRes.json() : { courses: [] },
  ]);

  return {
    attendances: att.attendances || [],
    batches: batch.batches || [],
    courses: course.courses || [],
  };
}

export default async function AdminAttendancePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value || "";
  const baseUrl = await getRequestOrigin();

  const data = await getAllData(token, baseUrl);

  return (
    <AdminPageLayout
      title="Presensi Global"
      subtitle="Pantau seluruh data kehadiran siswa di semua batch dan mata pelajaran secara real-time."
    >
      <AdminAttendanceClient
        initialAttendances={data.attendances}
        batches={data.batches}
        courses={data.courses}
      />
    </AdminPageLayout>
  );
}
