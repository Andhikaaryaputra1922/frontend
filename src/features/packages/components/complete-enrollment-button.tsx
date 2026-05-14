"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

export function CompleteEnrollmentButton({ enrollmentId }: { enrollmentId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onClick = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/enrollments/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ enrollmentId }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        setMessage(data?.message ?? "Gagal menyelesaikan course");
        return;
      }
      setMessage("Course selesai. Sertifikat dibuat.");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={isLoading}
        className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2.5 text-xs font-semibold text-[var(--primary-ink)] hover:brightness-95 disabled:opacity-60"
      >
        {isLoading ? "Memproses…" : "Mark complete"}
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--accent)] text-[var(--text)]">
          <ArrowUpRight size={16} />
        </span>
      </button>
      {message ? <p className="text-xs font-semibold text-[var(--muted)]">{message}</p> : null}
    </div>
  );
}

