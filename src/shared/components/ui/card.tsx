import type { ReactNode } from "react";

type CardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
};

export function StatCard({
  title,
  value,
  description,
  icon,
}: CardProps) {
  return (
    <div className="group relative overflow-hidden rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[var(--primary)]/10 blur-3xl" />
      <div className="relative">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--muted)]">{title}</p>
            <h3 className="mt-3 text-4xl font-black tracking-tight text-[var(--text)]">
              {value}
            </h3>
          </div>

          {icon ? (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)] text-[var(--primary-ink)] shadow-lg">
              {icon}
            </div>
          ) : null}
        </div>

        {description ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[var(--muted)]">{description}</p>
            <span className="rounded-full border border-[var(--border)] bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-[var(--text)]">
              Live
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
