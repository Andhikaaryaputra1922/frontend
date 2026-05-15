"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

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

      const data = await response.json() as { user?: { role?: string } };
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
        const data = await res.json() as { user?: { role?: string } };
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
    <div className="w-full max-w-sm space-y-8">
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
          <div className="relative group">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-4 pr-12 py-3.5 text-sm font-medium transition-all focus:border-[#E5B54F] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#E5B54F]/10"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1A2E44] transition-colors p-1"
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          </div>
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
        <span className="font-semibold text-slate-500">Kebijakan Privasi</span>.
      </p>
    </div>
  );
}