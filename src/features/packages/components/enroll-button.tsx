"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

export function EnrollButton({ courseId, disabled }: { courseId: string; disabled: boolean }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    setIsLoading(true);
    try {
      await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
        credentials: "include",
      });
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-5 py-2.5 text-xs font-semibold text-[var(--primary-ink)] hover:brightness-95 disabled:opacity-60"
    >
      {disabled ? "Enrolled" : isLoading ? "Enrolling…" : "Enroll"}
      <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--accent)] text-[var(--text)]">
        <ArrowUpRight size={16} />
      </span>
    </button>
  );
}

