"use client";

import { useState } from "react";
import { ArrowUpRight, CheckCircle2, Loader2, Trophy, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type QuizQuestion = {
  id: string;
  question: string;
  type: string;
  points: number;
  orderNumber: number;
  optionsJson?: unknown;
};

export function QuizTake({ quizId, questions }: { quizId: string; questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{ score: number; passScore: number; passed: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ answersJson: answers }),
      });

      const data = (await response.json().catch(() => null)) as
        | { result?: { score: number; passScore: number; passed: boolean }; message?: string }
        | null;

      if (!response.ok) {
        setError(data?.message ?? "Gagal submit quiz");
        setIsLoading(false);
        return;
      }

      if (!data?.result) {
        setError("Response tidak valid");
        setIsLoading(false);
        return;
      }

      // Enter analyzing state for a "premium" feel
      setIsAnalyzing(true);
      
      // Artificial delay for the "wow" factor
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      setResult(data.result);
    } catch (err) {
      setError("Terjadi kesalahan koneksi");
    } finally {
      setIsLoading(false);
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[400px] flex-col items-center justify-center rounded-[40px] border border-[var(--border)] bg-[var(--surface)] p-10 text-center shadow-xl"
      >
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="h-20 w-20 rounded-full border-4 border-[var(--primary)]/20 border-t-[var(--primary)]"
          />
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Loader2 className="animate-spin text-[var(--primary)]" size={32} />
          </motion.div>
        </div>
        <h2 className="mt-8 text-2xl font-black tracking-tight text-[var(--text)]">Menganalisis Jawabanmu...</h2>
        <p className="mt-2 text-[var(--muted)] font-medium">Sistem sedang menghitung skor akhir dan mengevaluasi performamu.</p>
        
        <div className="mt-10 w-full max-w-xs space-y-3">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, delay: i * 0.4 }}
              className="h-1.5 rounded-full bg-[var(--primary)]/10"
            >
              <motion.div 
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="h-full w-1/3 rounded-full bg-[var(--primary)]"
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (result) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-[40px] border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-2xl md:p-12"
      >
        <div className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full ${
          result.passed ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
        }`}>
          {result.passed ? <Trophy size={48} /> : <XCircle size={48} />}
        </div>
        
        <h2 className="text-3xl font-black tracking-tight text-[var(--text)] md:text-4xl">
          {result.passed ? "Luar Biasa!" : "Tetap Semangat!"}
        </h2>
        
        <p className="mt-3 text-lg font-medium text-[var(--muted)]">
          {result.passed 
            ? "Selamat, kamu berhasil lulus quiz ini dengan hasil yang memuaskan." 
            : "Sayang sekali, kamu belum mencapai skor minimal untuk lulus kali ini."}
        </p>

        <div className="mt-10 grid grid-cols-2 gap-4">
          <div className="rounded-3xl bg-[var(--base)] p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Skor Kamu</p>
            <p className={`mt-2 text-4xl font-black ${result.passed ? "text-green-600" : "text-red-600"}`}>
              {Math.round(result.score)}
            </p>
          </div>
          <div className="rounded-3xl bg-[var(--base)] p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Target Lulus</p>
            <p className="mt-2 text-4xl font-black text-[var(--text)]">{result.passScore}</p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 rounded-full bg-black px-8 py-4 text-sm font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {result.passed ? "Ambil Ulang" : "Coba Lagi"}
          </button>
          <button
            onClick={() => window.history.back()}
            className="flex-1 rounded-full border border-[var(--border)] bg-[var(--surface)] px-8 py-4 text-sm font-bold text-[var(--text)] transition-transform hover:bg-black/5"
          >
            Kembali
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5 pb-20">
      {questions.map((q) => {
        const options = Array.isArray(q.optionsJson) ? (q.optionsJson as unknown[]) : null;
        return (
          <div
            key={q.id}
            className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 transition-all hover:border-[var(--primary)]/30 md:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-base font-black leading-snug text-[var(--text)] md:text-lg">
                {q.orderNumber}. {q.question}
              </h3>
              <span className="shrink-0 rounded-2xl border border-[var(--border)] bg-[var(--base)]/70 px-4 py-1.5 text-xs font-bold text-[var(--muted)]">
                {q.points} PTS
              </span>
            </div>

            {options ? (
              <div className="mt-6 grid gap-3">
                {options.map((opt) => {
                  const value = String(opt);
                  const checked = answers[q.id] === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: value }))}
                      className={`group flex items-center gap-4 rounded-2xl border p-4 text-left text-sm font-bold transition-all ${
                        checked
                          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-ink)] shadow-lg shadow-[var(--primary)]/20"
                          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--primary)]/30 hover:bg-[var(--base)]"
                      }`}
                    >
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                        checked ? "border-white bg-white/20" : "border-[var(--border)]"
                      }`}>
                        {checked && <CheckCircle2 size={14} />}
                      </div>
                      {value}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="mt-6">
                <textarea
                  className="min-h-[100px] w-full resize-none rounded-2xl border border-[var(--border)] bg-[var(--base)] px-5 py-4 text-sm font-semibold outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/15"
                  placeholder="Ketik jawaban kamu di sini..."
                  value={typeof answers[q.id] === "string" ? (answers[q.id] as string) : ""}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                />
              </div>
            )}
          </div>
        );
      })}

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 right-0 border-t border-[var(--border)] bg-[var(--surface)]/80 p-5 backdrop-blur-xl md:static md:rounded-full md:border md:bg-transparent md:p-0 md:backdrop-blur-none">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading || Object.keys(answers).length === 0}
          className="group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-[var(--primary)] px-8 py-4 text-sm font-black text-[var(--primary-ink)] transition-all hover:scale-[1.02] hover:brightness-95 active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              Submit Quiz
              <ArrowUpRight className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

