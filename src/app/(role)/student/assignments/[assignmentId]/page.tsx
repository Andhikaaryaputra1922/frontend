import Link from "next/link";
import { cookies } from "next/headers";
import { getAuthCookieName } from "@/shared/lib/auth/jwt";
import { getRequestOrigin } from "@/shared/lib/origin";
import { AssignmentSubmit } from "@/features/courses/components/assignment-submit";
import BackButton from "@/shared/components/ui/BackButton";

type Attachment = {
  id: string;
  title?: string | null;
  url: string;
  createdAt: string;
};

type Assignment = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  course?: { id: string; title: string };
  attachments?: Attachment[];
};

async function getAssignment(assignmentId: string): Promise<Assignment | null> {
  const baseUrl = await getRequestOrigin();
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value;

  const response = await fetch(`${baseUrl}/api/assignments/${assignmentId}`, {
    cache: "no-store",
    headers: token ? { cookie: `${getAuthCookieName()}=${token}` } : undefined,
  });

  if (!response.ok) return null;
  const data = (await response.json()) as { assignment: Assignment };
  return data.assignment ?? null;
}

export default async function StudentAssignmentDetailPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  const assignment = await getAssignment(assignmentId);

  if (!assignment) {
    return (
      <main className="min-h-screen bg-[var(--base)] px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-[40px] border border-[var(--border)] bg-[var(--surface)] p-7 md:p-10">
          <p className="text-sm font-semibold text-[var(--muted)]">Tugas tidak ditemukan.</p>
          <Link className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--text)]" href="/student/assignments">
            Kembali
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--base)] px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[40px] border border-[var(--border)] bg-[var(--surface)] p-7 md:p-10">

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-[var(--text)] md:text-4xl">
                {assignment.title}
              </h1>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {assignment.course?.title ?? "Course"} • Due{" "}
                {new Date(assignment.dueDate).toLocaleDateString("id-ID")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <BackButton />
              <Link
                href="/student/assignments"
                className="rounded-full border border-[var(--border)] bg-[var(--base)]/70 px-5 py-3 text-sm font-semibold text-[var(--text)] hover:bg-black/5"
              >
                Back
              </Link>
            </div>
          </div>

          <div className="mt-7 rounded-[28px] border border-[var(--border)] bg-[var(--base)]/70 p-6">
            <p className="text-sm font-semibold text-[var(--text)]">Brief</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{assignment.description}</p>
            <p className="mt-4 text-xs font-semibold text-[var(--muted)]">Max score: {assignment.maxScore}</p>
          </div>

          {assignment.attachments && assignment.attachments.length > 0 && (
            <div className="mt-6 rounded-[28px] border border-[var(--border)] bg-[var(--base)]/70 p-6">
              <p className="text-sm font-semibold text-[var(--text)]">Lampiran referensi</p>
              <div className="mt-4 grid gap-2">
                {assignment.attachments.map((a) => (
                  <a
                    key={a.id}
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-semibold text-[var(--text)] hover:bg-black/5"
                  >
                    {a.title ?? a.url}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <AssignmentSubmit assignmentId={assignment.id} />
          </div>

        </div>
      </div>
    </main>
  );
}
