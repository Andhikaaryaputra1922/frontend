import { cookies } from "next/headers";
import { getAuthCookieName } from "@/shared/lib/auth/jwt";
import { getRequestOrigin } from "@/shared/lib/origin";
import AdminPageLayout, { AdminButton } from "@/features/users/components/layouts/AdminPageLayout";
import AdminCertificateClient from "./certificates-client";

async function getData(token: string, baseUrl: string) {
  const [batchRes, courseRes] = await Promise.all([
    fetch(`${baseUrl}/api/batches?includePackages=true`, {
      headers: { cookie: `${getAuthCookieName()}=${token}` },
      cache: "no-store",
    }),
    fetch(`${baseUrl}/api/courses`, {
      headers: { cookie: `${getAuthCookieName()}=${token}` },
      cache: "no-store",
    }),
  ]);

  const [batch, course] = await Promise.all([
    batchRes.ok ? batchRes.json() : { batches: [] },
    courseRes.ok ? courseRes.json() : { courses: [] },
  ]);

  return {
    batches: batch.batches || [],
    courses: course.courses || [],
  };
}

export default async function AdminCertificatesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value || "";
  const baseUrl = await getRequestOrigin();
  const data = await getData(token, baseUrl);

  return (
    <AdminPageLayout
      title="Manajemen Sertifikat"
      subtitle="Terbitkan, upload PDF, dan kelola sertifikat siswa."
    >
      <AdminCertificateClient
        batches={data.batches}
        courses={data.courses}
      />
    </AdminPageLayout>
  );
}
