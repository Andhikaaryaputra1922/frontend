"use client";

import { useState, useRef } from "react";

interface Props {
  assignmentId: string;
  onSuccess?: () => void;
}

export function AssignmentSubmit({ assignmentId, onSuccess }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    setFiles((prev) => {
      const existing = prev.map((f) => f.name);
      return [...prev, ...selected.filter((f) => !existing.includes(f.name))];
    });
    setError(null);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((prev) => {
      const existing = prev.map((f) => f.name);
      return [...prev, ...dropped.filter((f) => !existing.includes(f.name))];
    });
    setError(null);
  }

  function removeFile(name: string) {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function handleSubmit() {
    if (files.length === 0) {
      setError("Pilih minimal satu file untuk dikumpulkan.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      formData.append("assignmentId", assignmentId);

      const res = await fetch(`/api/assignments/${assignmentId}/submit`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? "Gagal mengumpulkan tugas.");
      }

      setSubmitted(true);
      onSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setUploading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-[28px] border border-[var(--border)] bg-[var(--base)]/70 p-8 text-center">
        <p className="text-3xl mb-3">✅</p>
        <p className="text-sm font-bold text-[var(--text)]">Tugas Berhasil Dikumpulkan!</p>
        <p className="text-sm text-[var(--muted)] mt-1">Guru akan memeriksa tugasmu segera.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-[var(--text)]">Kumpulkan Tugas</p>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer rounded-[28px] border-2 border-dashed border-[var(--border)] bg-[var(--base)]/70 px-6 py-10 text-center hover:bg-black/5 transition-colors"
      >
        <p className="text-3xl mb-2">📎</p>
        <p className="text-sm font-semibold text-[var(--text)]">Klik atau seret file ke sini</p>
        <p className="text-xs text-[var(--muted)] mt-1">PDF, Word, Gambar, ZIP — maks. 20MB per file</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip,.rar"
        />
      </div>

      {files.length > 0 && (
        <div className="grid gap-2">
          {files.map((f) => (
            <div key={f.name} className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-lg">📄</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text)] truncate">{f.name}</p>
                  <p className="text-xs text-[var(--muted)]">{formatSize(f.size)}</p>
                </div>
              </div>
              <button onClick={() => removeFile(f.name)} className="ml-3 text-sm text-[var(--muted)] hover:text-red-500 transition-colors flex-shrink-0" aria-label="Hapus file">✕</button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={uploading || files.length === 0}
        className="w-full rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--text)] hover:bg-black/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {uploading ? "Mengumpulkan…" : `Kumpulkan${files.length > 0 ? ` (${files.length} file)` : ""}`}
      </button>
    </div>
  );
}

export default AssignmentSubmit;
