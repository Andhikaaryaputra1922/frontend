"use client";

type Course = { id: string; title: string };
type Assignment = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  course: { id: string; title: string };
};

type Props = {
  basePath: string;
  courses: Course[];
  localAssignments: Assignment[];
};

export function AssignmentsManager({ basePath, courses, localAssignments }: Props) {
  return (
    <div className="space-y-4">
      {localAssignments.length === 0 ? (
        <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <p className="text-sm text-[var(--muted)]">Belum ada assignment.</p>
        </div>
      ) : (
        localAssignments.map((a) => (
          <div key={a.id} className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-black tracking-tight text-[var(--text)]">{a.title}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{a.course.title}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{a.description}</p>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Due: {new Date(a.dueDate).toLocaleDateString("id-ID")} · Max Score: {a.maxScore}
                </p>
              </div>
              <a href={`${basePath}/localAssignments/${a.id}`} className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--base)]/70 px-4 py-2 text-sm font-semibold text-[var(--text)] hover:bg-black/5">
                Detail
              </a>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
