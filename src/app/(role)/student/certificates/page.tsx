import Link from "next/link";
import { cookies } from "next/headers";
import { getAuthCookieName } from "@/shared/lib/auth/jwt";
import { getRequestOrigin } from "@/shared/lib/origin";
import BackButton from "@/shared/components/ui/BackButton";

type Certificate = {
  id: string;
  certificateCode: string;
  issuedAt: string;
  course?: { id: string; title: string };
};

async function getCertificates(): Promise<Certificate[]> {
  const baseUrl = await getRequestOrigin();
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value;

  const response = await fetch(`${baseUrl}/api/certificates`, {
    cache: "no-store",
    headers: token ? { cookie: `${getAuthCookieName()}=${token}` } : undefined,
  });

  if (!response.ok) return [];
  const data = (await response.json()) as { certificates: Certificate[] };
  return data.certificates ?? [];
}

export default async function StudentCertificatesPage() {
  const certificates = await getCertificates();

  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[40px] border border-[var(--border)] bg-white p-7 md:p-10 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-[var(--text)] md:text-4xl">
                Certificates
              </h1>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Sertifikat dibuat otomatis setelah course diselesaikan.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <BackButton />
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {certificates.length > 0 ? (
              certificates.map((c) => (
                <div
                  key={c.id}
                  className="rounded-[32px] border border-[var(--border)] bg-slate-50/50 p-6 shadow-sm"
                >
                  <p className="text-sm font-semibold text-[var(--muted)]">
                    {c.course?.title ?? "Course"}
                  </p>
                  <p className="mt-2 text-lg font-black tracking-tight text-[var(--text)]">
                    {c.certificateCode}
                  </p>
                  <p className="mt-3 text-xs font-semibold text-[var(--muted)]">
                    Issued: {new Date(c.issuedAt).toLocaleDateString("id-ID")}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[32px] border border-dashed border-[var(--border)] bg-slate-50/50 p-8 text-[var(--muted)] md:col-span-2">
                Belum ada sertifikat.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

