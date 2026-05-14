import Link from "next/link";
import { cookies } from "next/headers";
import { getAuthCookieName } from "@/shared/lib/auth/jwt";
import { getRequestOrigin } from "@/shared/lib/origin";
import { AssignmentGrading } from "@/features/courses/components/management/assignment-grading";
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

type Submission = {
  id: string;
  submissionUrl: string;
  submittedAt: string;
  score?: number | null;
  feedback?: string | null;
  status: string;
  student: { id: string; name?: string | null; email: string };
};

async function getAssignment(baseUrl: string, token: string, assignmentId: string): Promise<Assignment | null> {
  const response = await fetch(`${baseUrl}/api/assignments/${assignmentId}`, {
    cache: "no-store",
    headers: { cookie: `${getAuthCookieName()}=${token}` },
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { assignment: Assignment };
  return data.assignment ?? null;
}

async function getSubmissions(baseUrl: string, token: string, assignmentId: string): Promise<Submission[]> {
  const response = await fetch(`${baseUrl}/api/assignments/${assignmentId}/submissions`, {
    cache: "no-store",
    headers: { cookie: `${getAuthCookieName()}=${token}` },
  });
  if (!response.ok) return [];
  const data = (await response.json()) as { submissions: Submission[] };
  return data.submissions ?? [];
}

export default async function TeacherAssignmentDetailPage({ params }: { params: Promise<{ assignmentId: string }> }) {
  const { assignmentId } = await params;
  const baseUrl = await getRequestOrigin();
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value ?? "";

  const [assignment, submissions] = await Promise.all([
    getAssignment(baseUrl, token, assignmentId),
    getSubmissions(baseUrl, token, assignmentId),
  ]);

  if (!assignment) {
    return (
      <main className="min-h-screen bg-[var(--base)] px-6 py-10">
        <div className="mx-auto max-w-3xl rounded-[40px] border border-[var(--border)] bg-[var(--surface)] p-7 md:p-10">
          <p className="text-sm font-semibold text-[var(--muted)]">Assignment tidak ditemukan.</p>
          <Link className="mt-6 inline-flex rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--text)]" href="/teacher/assignments">
            Kembali
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--base)] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--muted)]">{assignment.course?.title ?? "Course"}</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--text)] md:text-4xl">
              {assignment.title}
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Due: {new Date(assignment.dueDate).toLocaleString("id-ID")} • Max score: {assignment.maxScore}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <BackButton />
            <Link
              href="/teacher/assignments"
              className="inline-flex rounded-full border border-[var(--border)] bg-[var(--base)]/70 px-5 py-3 text-sm font-semibold text-[var(--text)] hover:bg-black/5"
            >
              Kembali
            </Link>
          </div>
        </div>

        <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <p className="text-sm font-semibold text-[var(--muted)]">Brief</p>
          <p className="mt-3 text-sm leading-6 text-[var(--text)]">{assignment.description}</p>
        </div>

        {assignment.attachments && assignment.attachments.length > 0 ? (
          <div className="mt-6 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <p className="text-sm font-semibold text-[var(--muted)]">Lampiran referensi</p>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {assignment.attachments.map((a) => (
                <a
                  key={a.id}
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-[var(--border)] bg-[var(--base)]/70 px-4 py-3 text-sm font-semibold text-[var(--text)] hover:bg-black/5"
                >
                  {a.title ?? a.url}
                </a>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6">
          <AssignmentGrading assignmentId={assignment.id} maxScore={assignment.maxScore} submissions={submissions} />
        </div>
      </div>
    </main>
  );
}
