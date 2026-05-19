import { cookies } from "next/headers";
import { getAuthCookieName } from "@/shared/lib/auth/jwt";
import { getRequestOrigin } from "@/shared/lib/origin";
import StudentCertificatesClient from "./certificates-client";

async function getCertificates(token: string, baseUrl: string) {
  const res = await fetch(`${baseUrl}/api/certificates`, {
    cache: "no-store",
    headers: token ? { cookie: `${getAuthCookieName()}=${token}` } : undefined,
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.certificates ?? [];
}

export default async function StudentCertificatesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value || "";
  const baseUrl = await getRequestOrigin();
  const certificates = await getCertificates(token, baseUrl);

  return <StudentCertificatesClient certificates={certificates} />;
}
