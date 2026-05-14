"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Trash2 } from "lucide-react";

type Course = { id: string; title: string };

type Quiz = {
  id: string;
  title: string;
  description?: string | null;
  passScore: number;
  maxAttempts: number;
  isRandomized: boolean;
  timeLimit?: number | null;
  course: Course;
};

type Props = {
  basePath: "/teacher" | "/admin";
  courses: Course[];
  quizzes: Quiz[];
};

export function QuizzesManager({ basePath, courses, quizzes }: Props) {
  const router = useRouter();
  const courseOptions = useMemo(() => courses, [courses]);

  const [courseId, setCourseId] = useState(courseOptions[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [passScore, setPassScore] = useState(70);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [isRandomized, setIsRandomized] = useState(false);
  const [timeLimit, setTimeLimit] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const payload = {
        courseId,
        title,
        description: description.trim() ? description.trim() : undefined,
        passScore,
        maxAttempts,
        isRandomized,
        timeLimit: timeLimit.trim() ? Number(timeLimit) : undefined,
      };

      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        setError(data?.message ?? "Gagal membuat quiz");
        return;
      }

      setTitle("");
      setDescription("");
      setTimeLimit("");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  const deleteQuiz = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/quizzes/${id}`, { method: "DELETE", credentials: "include" });
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        setError(data?.message ?? "Gagal menghapus quiz");
        return;
      }
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <p className="text-lg font-black tracking-tight text-[var(--text)]">Buat quiz</p>
        <p className="mt-2 text-sm text-[var(--muted)]">Pilih course, lalu susun pertanyaan setelah quiz dibuat.</p>

        <form onSubmit={createQuiz} className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-[var(--muted)]">Course</span>
            <select
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/15"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              required
            >
              {courseOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-[var(--muted)]">Judul</span>
            <input
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/15"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-xs font-semibold text-[var(--muted)]">Deskripsi (opsional)</span>
            <textarea
              className="min-h-24 w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/15"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-[var(--muted)]">Pass score</span>
            <input
              type="number"
              min={0}
              max={100}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/15"
              value={passScore}
              onChange={(e) => setPassScore(Number(e.target.value))}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-[var(--muted)]">Max attempts</span>
            <input
              type="number"
              min={1}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/15"
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(Number(e.target.value))}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-[var(--muted)]">Time limit (menit)</span>
            <input
              type="number"
              min={1}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/15"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
              placeholder="Kosongkan jika tidak ada"
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--base)]/70 px-4 py-3 text-sm font-semibold text-[var(--text)]">
            <input type="checkbox" checked={isRandomized} onChange={(e) => setIsRandomized(e.target.checked)} />
            Randomize questions
          </label>

          {error ? (
            <div className="md:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isLoading || !courseId}
            className="md:col-span-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-ink)] hover:brightness-95 disabled:opacity-60"
          >
            {isLoading ? "Membuat…" : "Buat quiz"}
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--accent)] text-[var(--text)]">
              <ArrowUpRight size={18} />
            </span>
          </button>
        </form>
      </div>

      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <p className="text-lg font-black tracking-tight text-[var(--text)]">Daftar quiz</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {quizzes.length > 0 ? (
            quizzes.map((q) => (
              <div key={q.id} className="rounded-[28px] border border-[var(--border)] bg-[var(--base)]/70 p-5">
                <p className="text-sm font-semibold text-[var(--muted)]">{q.course?.title ?? "Course"}</p>
                <p className="mt-2 text-lg font-black tracking-tight text-[var(--text)]">{q.title}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--muted)]">
                  <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1">
                    Pass: {q.passScore}
                  </span>
                  <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1">
                    Attempts: {q.maxAttempts}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <Link
                    href={`${basePath}/quizzes/${q.id}`}
                    className="inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-xs font-black text-[var(--text)]"
                  >
                    Builder
                  </Link>
                  <Link
                    href={`${basePath}/quizzes/${q.id}/attempts`}
                    className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--text)] hover:bg-black/5"
                  >
                    Attempts
                  </Link>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => deleteQuiz(q.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--text)] hover:bg-black/5 disabled:opacity-60"
                  >
                    <Trash2 size={14} />
                    Hapus
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[28px] border border-dashed border-[var(--border)] bg-[var(--base)]/70 p-6 text-sm text-[var(--muted)] md:col-span-2">
              Belum ada quiz.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

