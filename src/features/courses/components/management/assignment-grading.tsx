"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

type Submission = {
  id: string;
  submissionUrl: string;
  submittedAt: string;
  score?: number | null;
  feedback?: string | null;
  status: string;
  student: { id: string; name?: string | null; email: string };
};

type Props = {
  assignmentId: string;
  maxScore: number;
  submissions: Submission[];
};

export function AssignmentGrading({ assignmentId, maxScore, submissions }: Props) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [draft, setDraft] = useState<Record<string, { score: string; feedback: string; status: string }>>(() => {
    const initial: Record<string, { score: string; feedback: string; status: string }> = {};
    for (const s of submissions) {
      initial[s.id] = {
        score: typeof s.score === "number" ? String(s.score) : "",
        feedback: s.feedback ?? "",
        status: s.status ?? "SUBMITTED",
      };
    }
    return initial;
  });

  const grade = async (submissionId: string) => {
    setIsSaving(true);
    setError(null);
    try {
      const d = draft[submissionId];
      const scoreValue = d.score.trim() ? Number(d.score) : undefined;
      const response = await fetch(`/api/assignments/${assignmentId}/submissions/${submissionId}/grade`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...(typeof scoreValue === "number" ? { score: scoreValue } : {}),
          ...(d.feedback.trim() ? { feedback: d.feedback.trim() } : {}),
          status: d.status,
        }),
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        setError(data?.message ?? "Gagal menyimpan nilai");
        return;
      }
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      {submissions.length > 0 ? (
        submissions.map((s) => {
          const d = draft[s.id] ?? { score: "", feedback: "", status: "SUBMITTED" };
          return (
            <div key={s.id} className="rounded-[28px] border border-[var(--border)] bg-[var(--base)]/70 p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-black text-[var(--text)]">{s.student.name ?? s.student.email}</p>
                  <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
                    Submitted: {new Date(s.submittedAt).toLocaleString("id-ID")}
                  </p>
                  <a
                    href={s.submissionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-black text-[var(--text)]"
                  >
                    Buka jawaban
                  </a>
                </div>

                <div className="w-full max-w-lg space-y-3">
                  <div className="grid gap-3 md:grid-cols-3">
                    <label className="block">
                      <span className="mb-2 block text-xs font-semibold text-[var(--muted)]">Score</span>
                      <input
                        type="number"
                        min={0}
                        max={maxScore}
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/15"
                        value={d.score}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            [s.id]: { ...d, score: e.target.value },
                          }))
                        }
                      />
                    </label>
                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-xs font-semibold text-[var(--muted)]">Status</span>
                      <select
                        className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/15"
                        value={d.status}
                        onChange={(e) =>
                          setDraft((prev) => ({
                            ...prev,
                            [s.id]: { ...d, status: e.target.value },
                          }))
                        }
                      >
                        <option value="SUBMITTED">SUBMITTED</option>
                        <option value="GRADED">GRADED</option>
                        <option value="REVISION_REQUESTED">REVISION_REQUESTED</option>
                      </select>
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold text-[var(--muted)]">Feedback</span>
                    <textarea
                      className="min-h-24 w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/15"
                      value={d.feedback}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          [s.id]: { ...d, feedback: e.target.value },
                        }))
                      }
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => grade(s.id)}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-[var(--primary-ink)] hover:brightness-95 disabled:opacity-60"
                  >
                    <Save size={18} />
                    {isSaving ? "Menyimpan…" : "Simpan"}
                  </button>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="rounded-[28px] border border-dashed border-[var(--border)] bg-[var(--base)]/70 p-6 text-sm text-[var(--muted)]">
          Belum ada submission.
        </div>
      )}
    </div>
  );
}

