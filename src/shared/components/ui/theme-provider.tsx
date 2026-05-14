"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "system" | "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") {
    root.removeAttribute("data-theme");
    return;
  }
  root.setAttribute("data-theme", theme);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    try {
      const stored = window.localStorage.getItem("haneenacademy.theme") as Theme | null;
      if (stored === "light" || stored === "dark" || stored === "system") return stored;
    } catch {}
    return "system";
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem("haneenacademy.theme", next);
    } catch {}
  };

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
