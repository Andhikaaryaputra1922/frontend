"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: identifier, password }),
      });

      if (!response.ok) {
        setError("Email/Username atau password salah.");
        return;
      }

      const meResponse = await fetch("/api/auth/me", { credentials: "include" });
      if (!meResponse.ok) { router.push("/dashboard"); return; }

      const data = await meResponse.json() as { user?: { role?: string } };
      const role = data.user?.role;

      if (role === "ADMIN") { router.push("/admin"); return; }
      if (role === "TEACHER") { router.push("/teacher"); return; }
      router.push("/student");
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const onGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      if (res.ok) {
        toast.success("Login Google Berhasil!");
        const meResponse = await fetch("/api/auth/me", { credentials: "include" });
        const data = await meResponse.json() as { user?: { role?: string } };
        const role = data.user?.role;
        if (role === "ADMIN") router.push("/admin");
        else if (role === "TEACHER") router.push("/teacher");
        else router.push("/student");
      } else {
        toast.error("Gagal login dengan Google");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "").trim()}>
      <main className="flex min-h-screen">
        {/* ── Left Panel (Branding) ── */}
        <section className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#1A2E44] p-12 lg:flex">
          {/* Animated Background Geometric Pattern */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#E5B54F" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>

          {/* Logo Section */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E5B54F] shadow-xl shadow-black/20">
              <span className="text-2xl font-black text-[#1A2E44]">H</span>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white">
                HANEEN<span className="text-[#E5B54F]">.</span>ACADEMY
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#E5B54F]/60">LMS Platform</p>
            </div>
          </div>

          {/* Center Quote */}
          <div className="relative z-10 my-auto max-w-md">
            <div className="mb-6 h-1 w-12 rounded-full bg-[#E5B54F]" />
            <h2 className="text-4xl font-black leading-[1.1] tracking-tighter text-white lg:text-5xl">
              Menuju Masa Depan <span className="text-[#E5B54F]">Gemilang</span> Bersama Al-Qur'an.
            </h2>
            <p className="mt-6 text-lg font-medium text-white/60">
              Platform bimbingan belajar terbaik untuk persiapan UTBK, TKA, dan kurikulum sekolah dengan pendekatan Islami.
            </p>
          </div>

          {/* Footer Info */}
          <div className="relative z-10 flex items-center justify-between text-sm font-medium text-white/40">
            <p>© 2026 Haneen Academy</p>
            <div className="flex gap-4">
              <span className="hover:text-white transition-colors cursor-pointer">Panduan</span>
              <span className="hover:text-white transition-colors cursor-pointer">Bantuan</span>
            </div>
          </div>
        </section>

        {/* ── Right Panel (Login Form) ── */}
        <section className="flex w-full flex-col items-center justify-center bg-white p-8 lg:w-1/2">
          <div className="w-full max-w-sm space-y-8">
            {/* Mobile Header (Visible only on small screens) */}
            <div className="flex flex-col items-center lg:hidden">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1A2E44] shadow-xl shadow-[#1A2E44]/20">
                <span className="text-2xl font-black text-[#E5B54F]">H</span>
              </div>
              <h1 className="text-xl font-black tracking-tighter text-[#1A2E44]">HANEEN ACADEMY</h1>
            </div>

            <div>
              <h2 className="text-3xl font-black tracking-tighter text-[#1A2E44]">Selamat Datang Kembali</h2>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Belum punya akun?{" "}
                <Link href="/register" className="font-bold text-[#E5B54F] hover:underline transition-all">
                  Daftar sekarang
                </Link>
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Email atau Username</label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-medium transition-all focus:border-[#E5B54F] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#E5B54F]/10"
                  placeholder="Masukkan email atau username"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Kata Sandi</label>
                  <Link href="/forgot-password" title="Lupa sandi?" className="text-xs font-bold text-[#E5B54F] hover:underline">
                    Lupa sandi?
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3.5 text-sm font-medium transition-all focus:border-[#E5B54F] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#E5B54F]/10"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-xs font-bold text-red-500">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-[#1A2E44] py-4 text-sm font-black text-white shadow-xl shadow-[#1A2E44]/20 transition-all hover:bg-[#0F1C2E] active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? "Memproses..." : "Masuk ke Akun"}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Atau masuk dengan</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={onGoogleSuccess}
                onError={() => toast.error("Google Login Failed")}
                theme="outline"
                shape="pill"
                size="large"
                width="384"
              />
            </div>

            <p className="mt-8 text-center text-xs text-slate-400 leading-relaxed">
              Dengan masuk, Anda menyetujui{" "}
              <span className="font-semibold text-slate-500">Syarat & Ketentuan</span> serta{" "}
              <span className="font-semibold text-slate-500">Kebijakan Privasi</span> Haneen Academy.
            </p>
          </div>
        </section>
      </main>
    </GoogleOAuthProvider>
  );
}