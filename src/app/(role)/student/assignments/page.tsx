import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthCookieName } from "@/shared/lib/auth/jwt";
import { getRequestOrigin } from "@/shared/lib/origin";
import BackButton from "@/shared/components/ui/BackButton";

type Assignment = {
  id: string;
  title: string;
  courseName: string;
  dueDate: string;
  status: "pending" | "submitted" | "graded";
  grade?: number;
};

async function getAssignments(): Promise<Assignment[]> {
  const cookieStore = await cookies();
  const cookieName  = getAuthCookieName();
  const token       = cookieStore.get(cookieName)?.value;
  if (!token) return [];

  const origin = getRequestOrigin();

  try {
    const res = await fetch(`${origin}/api/student/assignments`, {
      headers: { Cookie: `${cookieName}=${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

const STATUS_LABEL: Record<Assignment["status"], string> = {
  pending:   "Belum Dikumpul",
  submitted: "Sudah Dikumpul",
  graded:    "Sudah Dinilai",
};
const STATUS_COLOR: Record<Assignment["status"], string> = {
  pending:   "bg-amber-100 text-amber-700",
  submitted: "bg-blue-100 text-blue-700",
  graded:    "bg-emerald-100 text-emerald-700",
};

export default async function AssignmentsPage() {
  const cookieStore = await cookies();
  const token       = cookieStore.get(getAuthCookieName())?.value;
  if (!token) redirect("/login");

  const assignments = await getAssignments();

  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <BackButton />

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black tracking-tight text-[var(--text)]">Tugas</h1>
          <span className="text-sm text-[var(--muted)]">{assignments.length} tugas</span>
        </div>

        {assignments.length === 0 ? (
          <div className="rounded-[40px] border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm text-[var(--muted)]">Belum ada tugas.</p>
          </div>
        ) : (
          <div className="rounded-[40px] border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)] overflow-hidden">
            {assignments.map((a) => (
              <Link
                key={a.id}
                href={`/student/assignments/${a.id}`}
                className="flex items-center justify-between px-7 py-5 hover:bg-black/5 transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--text)] text-sm truncate">{a.title}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{a.courseName} · Tenggat: {a.dueDate}</p>
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  {a.grade !== undefined && (
                    <span className="text-sm font-bold text-emerald-600">{a.grade}</span>
                  )}
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLOR[a.status]}`}>
                    {STATUS_LABEL[a.status]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
