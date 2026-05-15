"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    if (data.password !== data.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success("Registrasi Berhasil!");
        router.push("/student");
        router.refresh();
      } else {
        const errData = await res.json();
        setError(errData.message || "Gagal melakukan pendaftaran");
      }
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
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
        toast.success("Pendaftaran Google Berhasil!");
        router.push("/student");
        router.refresh();
      } else {
        toast.error("Gagal mendaftar with Google");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 py-10">
      <div>
        <h2 className="text-3xl font-black tracking-tighter text-[#1A2E44]">Mulai Belajar Hari Ini</h2>
        <p className="mt-2 text-sm font-medium text-slate-500">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-bold text-[#E5B54F] hover:underline transition-all">
            Masuk di sini
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Nama Lengkap</label>
            <input name="name" type="text" required className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium transition-all focus:border-[#E5B54F] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#E5B54F]/10" placeholder="Ahmad Fauzi" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Username</label>
            <input name="username" type="text" required className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium transition-all focus:border-[#E5B54F] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#E5B54F]/10" placeholder="ahmad_f" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Email</label>
            <input name="email" type="email" required className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium transition-all focus:border-[#E5B54F] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#E5B54F]/10" placeholder="ahmad@mail.com" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">WhatsApp</label>
            <input name="phone" type="tel" required className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium transition-all focus:border-[#E5B54F] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#E5B54F]/10" placeholder="0857..." />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Password</label>
            <div className="relative group">
              <input 
                name="password" 
                type={showPassword ? "text" : "password"} 
                required 
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-4 pr-12 py-3 text-sm font-medium transition-all focus:border-[#E5B54F] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#E5B54F]/10" 
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
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11-8 11-8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Konfirmasi</label>
            <div className="relative group">
              <input 
                name="confirmPassword" 
                type={showConfirmPassword ? "text" : "password"} 
                required 
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-4 pr-12 py-3 text-sm font-medium transition-all focus:border-[#E5B54F] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#E5B54F]/10" 
                placeholder="••••••••" 
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#1A2E44] transition-colors p-1"
              >
                {showConfirmPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11-8 11-8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Kode Kupon (Opsional)</label>
          <input name="couponCode" type="text" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 uppercase" placeholder="HANEEN2026" />
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-bold flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-[#1A2E44] py-4 text-sm font-black text-white shadow-xl shadow-[#1A2E44]/20 transition-all hover:bg-[#0F1C2E] active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? "Memproses..." : "Daftar Akun Baru"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Atau daftar dengan</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <div className="flex justify-center w-full">
        <GoogleLogin
          onSuccess={onGoogleSuccess}
          onError={() => toast.error("Google Signup Failed")}
          theme="outline"
          shape="pill"
          size="large"
          width="384"
        />
      </div>

      <p className="mt-8 text-center text-[10px] text-slate-400 leading-relaxed">
        Dengan mendaftar, Anda menyetujui{" "}
        <span className="font-semibold text-slate-500">Syarat & Ketentuan</span> serta{" "}
        <span className="font-semibold text-slate-500">Kebijakan Privasi</span>.
      </p>
    </div>
  );
}
