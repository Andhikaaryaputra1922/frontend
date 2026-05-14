"use client";

import { useState } from "react";

type Course = { id: string; title: string };

type NewAssignmentFormProps = {
  courses: Course[];
  baseUrl: string;
  token: string;
  onCreated: () => void;
};

export default function NewAssignmentForm({
  courses,
  baseUrl,
  token,
  onCreated,
}: NewAssignmentFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxScore, setMaxScore] = useState<number>(100);
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseUrl}/assignments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          dueDate,
          maxScore,
          courseId,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message ?? `Request failed with status ${response.status}`);
      }

      // Reset form on success
      setTitle("");
      setDescription("");
      setDueDate("");
      setMaxScore(100);
      setCourseId(courses[0]?.id ?? "");
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-bold text-[var(--text)]">Buat Assignment Baru</h2>

      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        {/* Title */}
        <div className="flex flex-col gap-1">
          <label htmlFor="title" className="text-sm font-medium text-[var(--text)]">
            Judul <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Masukkan judul assignment"
            className="rounded-lg border border-[var(--border)] bg-[var(--base)] px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--muted)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
          />
        </div>

        {/* Course Select */}
        <div className="flex flex-col gap-1">
          <label htmlFor="courseId" className="text-sm font-medium text-[var(--text)]">
            Kelas <span className="text-red-500">*</span>
          </label>
          <select
            id="courseId"
            required
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--base)] px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        {/* Due Date */}
        <div className="flex flex-col gap-1">
          <label htmlFor="dueDate" className="text-sm font-medium text-[var(--text)]">
            Tenggat Waktu <span className="text-red-500">*</span>
          </label>
          <input
            id="dueDate"
            type="datetime-local"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded-lg border border-[var(--border)] bg-[var(--base)] px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
          />
        </div>

        {/* Max Score */}
        <div className="flex flex-col gap-1">
          <label htmlFor="maxScore" className="text-sm font-medium text-[var(--text)]">
            Nilai Maksimal <span className="text-red-500">*</span>
          </label>
          <input
            id="maxScore"
            type="number"
            required
            min={1}
            max={1000}
            value={maxScore}
            onChange={(e) => setMaxScore(Number(e.target.value))}
            className="rounded-lg border border-[var(--border)] bg-[var(--base)] px-3 py-2 text-sm text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label htmlFor="description" className="text-sm font-medium text-[var(--text)]">
            Deskripsi
          </label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan detail assignment ini..."
            className="resize-none rounded-lg border border-[var(--border)] bg-[var(--base)] px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--muted)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
          />
        </div>

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-500 sm:col-span-2" role="alert">
            {error}
          </p>
        )}

        {/* Submit */}
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Menyimpan..." : "Buat Assignment"}
          </button>
        </div>
      </form>
    </section>
  );
}
