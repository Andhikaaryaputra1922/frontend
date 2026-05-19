"use client";

import { useTheme } from "./theme-provider";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2 ${
        isDark ? "bg-[#0B213F] border border-white/10" : "bg-slate-200 border border-slate-300"
      }`}
      role="switch"
      aria-checked={isDark}
    >
      <span className="sr-only">Toggle Theme</span>
      <span
        className={`absolute left-1 flex h-6 w-6 items-center justify-center rounded-full bg-white transition-transform duration-300 ${
          isDark ? "translate-x-8 shadow-md" : "translate-x-0 shadow-sm"
        }`}
      >
        {isDark ? (
          <Moon size={12} className="text-[#0B213F]" />
        ) : (
          <Sun size={12} className="text-[#D4AF37]" />
        )}
      </span>
    </button>
  );
}
