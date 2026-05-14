"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Plus, Save, Sparkles, Trash2 } from "lucide-react";

type QuizQuestion = {
  id: string;
  question: string;
  type: string;
  points: number;
  orderNumber: number;
  correctAnswer?: string | null;
  optionsJson?: unknown;
};

type Quiz = {
  id: string;
  title: string;
  description?: string | null;
  passScore: number;
  maxAttempts: number;
  isRandomized: boolean;
  timeLimit?: number | null;
  questions: QuizQuestion[];
};

type Props = {
  quiz: Quiz;
};

export function QuizBuilder({ quiz }: Props) {
  const router = useRouter();
  const sortedQuestions = useMemo(
    () => [...(quiz.questions ?? [])].sort((a, b) => a.orderNumber - b.orderNumber),
    [quiz.questions],
  );

  const [title, setTitle] = useState(quiz.title);
  const [description, setDescription] = useState(quiz.description ?? "");
  const [passScore, setPassScore] = useState(quiz.passScore);
  const [maxAttempts, setMaxAttempts] = useState(quiz.maxAttempts);
  const [isRandomized, setIsRandomized] = useState(quiz.isRandomized);
  const [timeLimit, setTimeLimit] = useState<string>(quiz.timeLimit ? String(quiz.timeLimit) : "");
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [qText, setQText] = useState("");
  const [qType, setQType] = useState("MULTIPLE_CHOICE");
  const [qPoints, setQPoints] = useState(1);
  const [qOptions, setQOptions] = useState("");
  const [qCorrect, setQCorrect] = useState("");

  const saveQuiz = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/quizzes/${quiz.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          description: description.trim() ? description.trim() : undefined,
          passScore,
          maxAttempts,
          isRandomized,
          timeLimit: timeLimit.trim() ? Number(timeLimit) : null,
        }),
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        setError(data?.message ?? "Gagal menyimpan quiz");
        return;
      }
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const addQuestion = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const options =
        qType === "MULTIPLE_CHOICE"
          ? qOptions
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined;

      const payload = {
        question: qText,
        type: qType,
        points: qPoints,
        ...(options ? { optionsJson: options } : {}),
        ...(qCorrect.trim() ? { correctAnswer: qCorrect.trim() } : {}),
      };

      const response = await fetch(`/api/quizzes/${quiz.id}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        setError(data?.message ?? "Gagal menambah pertanyaan");
        return;
      }

      setQText("");
      setQOptions("");
      setQCorrect("");
      setQPoints(1);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const deleteQuestion = async (questionId: string) => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/quizzes/${quiz.id}/questions/${questionId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        setError(data?.message ?? "Gagal menghapus pertanyaan");
        return;
      }
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAI(true);
    setError(null);
    try {
      const response = await fetch(`/api/quizzes/generate-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          prompt: aiPrompt,
          context: {
            title,
            description,
            existingQuestions: sortedQuestions.map((q) => q.question),
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Gagal generate soal dengan AI");
        return;
      }

      const generatedQuestions = data.questions;
      if (!Array.isArray(generatedQuestions)) {
        setError("Format respons AI tidak valid");
        return;
      }

      // We add them one by one for simplicity given current backend routes
      for (const q of generatedQuestions) {
        await fetch(`/api/quizzes/${quiz.id}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            question: q.question,
            type: q.type,
            points: q.points || 1,
            optionsJson: q.optionsJson,
            correctAnswer: q.correctAnswer,
          }),
        });
      }

      setAiPrompt("");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat menghubungi AI.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <p className="text-lg font-black tracking-tight text-[var(--text)]">Detail quiz</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-[var(--muted)]">Judul</span>
            <input
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/15"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-xs font-semibold text-[var(--muted)]">Deskripsi</span>
            <textarea
              className="min-h-24 w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/15"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="button"
          onClick={saveQuiz}
          disabled={isSaving}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-ink)] hover:brightness-95 disabled:opacity-60"
        >
          <Save size={18} />
          {isSaving ? "Menyimpan…" : "Simpan"}
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--accent)] text-[var(--text)]">
            <ArrowUpRight size={18} />
          </span>
        </button>
      </div>

      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--accent)] text-[var(--text)]">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-lg font-black tracking-tight text-[var(--text)]">AI Question Generator</p>
            <p className="text-sm text-[var(--muted)]">Generate soal otomatis menggunakan AI.</p>
          </div>
        </div>
        
        <div className="mt-5">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-[var(--muted)]">Prompt AI (Topik atau deskripsi materi)</span>
            <textarea
              className="min-h-24 w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/15"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Contoh: Buat 5 soal pilihan ganda tentang sejarah Indonesia untuk kelas 10."
            />
          </label>

          <button
            type="button"
            onClick={generateWithAI}
            disabled={isGeneratingAI || !aiPrompt.trim()}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-black/90 disabled:opacity-60"
          >
            <Sparkles size={18} />
            {isGeneratingAI ? "Sedang men-generate…" : "Generate Soal AI"}
          </button>
        </div>
      </div>

      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-lg font-black tracking-tight text-[var(--text)]">Pertanyaan</p>
            <p className="mt-1 text-sm text-[var(--muted)]">Tambah pertanyaan (MCQ atau teks).</p>
          </div>
          <span className="rounded-full border border-[var(--border)] bg-[var(--base)]/70 px-4 py-2 text-xs font-semibold text-[var(--muted)]">
            Total: {sortedQuestions.length}
          </span>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-xs font-semibold text-[var(--muted)]">Pertanyaan</span>
            <textarea
              className="min-h-24 w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/15"
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              placeholder="Tulis pertanyaan…"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-[var(--muted)]">Tipe</span>
            <select
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/15"
              value={qType}
              onChange={(e) => setQType(e.target.value)}
            >
              <option value="MULTIPLE_CHOICE">Multiple choice</option>
              <option value="TEXT">Text</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-[var(--muted)]">Poin</span>
            <input
              type="number"
              min={1}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/15"
              value={qPoints}
              onChange={(e) => setQPoints(Number(e.target.value))}
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-xs font-semibold text-[var(--muted)]">Opsi (1 baris = 1 opsi)</span>
            <textarea
              className="min-h-24 w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/15"
              value={qOptions}
              onChange={(e) => setQOptions(e.target.value)}
              placeholder={"A\nB\nC\nD"}
              disabled={qType !== "MULTIPLE_CHOICE"}
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-xs font-semibold text-[var(--muted)]">Jawaban benar (opsional)</span>
            <input
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/15"
              value={qCorrect}
              onChange={(e) => setQCorrect(e.target.value)}
              placeholder="Untuk MCQ: isi salah satu opsi persis"
            />
          </label>

          <button
            type="button"
            onClick={addQuestion}
            disabled={isSaving || !qText.trim()}
            className="md:col-span-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-black text-[var(--text)] hover:brightness-[0.98] disabled:opacity-60"
          >
            <Plus size={18} />
            Tambah pertanyaan
          </button>
        </div>

        <div className="mt-8 grid gap-4">
          {sortedQuestions.length > 0 ? (
            sortedQuestions.map((q) => (
              <div key={q.id} className="rounded-[28px] border border-[var(--border)] bg-[var(--base)]/70 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-black text-[var(--text)]">
                      {q.orderNumber}. {q.question}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-[var(--muted)]">
                      {q.type} • {q.points} pts
                    </p>
                    {q.correctAnswer ? (
                      <p className="mt-2 text-xs font-semibold text-[var(--muted)]">
                        Correct: {q.correctAnswer}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteQuestion(q.id)}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--text)] hover:bg-black/5 disabled:opacity-60"
                  >
                    <Trash2 size={14} />
                    Hapus
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[28px] border border-dashed border-[var(--border)] bg-[var(--base)]/70 p-6 text-sm text-[var(--muted)]">
              Belum ada pertanyaan. Tambahkan pertanyaan pertama.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

