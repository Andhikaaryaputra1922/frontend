"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import { useLegalModal } from "@/shared/components/providers/LegalModalProvider";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { showSyarat, showPrivasi } = useLegalModal();
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
        toast.error("Gagal mendaftar dengan Google");
      }
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 py-8">

      {/* Header */}
      <div className="space-y-1.5">

        <h1 className="font-black tracking-tighter" style={{ fontSize: "26px", color: "#0B213F", lineHeight: 1.1 }}>
          Mulai Belajar<br />Hari Ini
        </h1>
        <p style={{ fontSize: "13px", fontWeight: 500, color: "rgba(11,33,63,0.45)", marginTop: "6px" }}>
          Sudah punya akun?{" "}
          <Link href="/login" style={{ color: "#D4AF37", fontWeight: 700 }} className="hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Row 1: Nama + Username */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="auth-label">Nama Lengkap</label>
            <input name="name" type="text" required className="auth-input" placeholder="Ahmad Fauzi" />
          </div>
          <div>
            <label className="auth-label">Username</label>
            <input name="username" type="text" required className="auth-input" placeholder="ahmad_f" />
          </div>
        </div>

        {/* Row 2: Email + WhatsApp */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="auth-label">Email</label>
            <input name="email" type="email" required className="auth-input" placeholder="ahmad@mail.com" />
          </div>
          <div>
            <label className="auth-label">WhatsApp</label>
            <input name="phone" type="tel" required className="auth-input" placeholder="0857..." />
          </div>
        </div>

        {/* Row 3: Password + Konfirmasi */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="auth-label">Password</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="auth-input"
                style={{ paddingRight: "44px" }}
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: "rgba(11,33,63,0.35)" }}>
                {showPassword ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
              </button>
            </div>
          </div>
          <div>
            <label className="auth-label">Konfirmasi</label>
            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                className="auth-input"
                style={{ paddingRight: "44px" }}
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: "rgba(11,33,63,0.35)" }}>
                {showConfirmPassword ? <EyeOff size={16} strokeWidth={2} /> : <Eye size={16} strokeWidth={2} />}
              </button>
            </div>
          </div>
        </div>

        {/* Kode Kupon */}
        <div>
          <label className="auth-label">Kode Kupon <span style={{ color: "rgba(11,33,63,0.3)", fontWeight: 600, textTransform: "none", letterSpacing: 0 }}>(opsional)</span></label>
          <input
            name="couponCode"
            type="text"
            className="auth-input uppercase"
            placeholder="HANEEN2026"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-xl p-3" style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.15)" }}>
            <div className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#dc2626" }}>{error}</p>
          </div>
        )}

        <button type="submit" disabled={isLoading} className="auth-btn-primary">
          {isLoading ? "Memproses..." : "Daftar Akun Baru"}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: "rgba(11,33,63,0.08)" }} />
        <span style={{ fontSize: "10px", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(11,33,63,0.3)" }}>
          atau
        </span>
        <div className="flex-1 h-px" style={{ background: "rgba(11,33,63,0.08)" }} />
      </div>

      {/* Google */}
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={onGoogleSuccess}
          onError={() => toast.error("Google Signup Failed")}
          theme="outline"
          shape="pill"
          size="large"
        />
      </div>

      {/* Legal */}
      <p className="text-center" style={{ fontSize: "10.5px", color: "rgba(11,33,63,0.35)", lineHeight: 1.6 }}>
        Dengan mendaftar, Anda menyetujui{" "}
        <button onClick={showSyarat} type="button" style={{ fontWeight: 700, color: "rgba(11,33,63,0.55)" }} className="hover:text-[#0B213F] transition-colors">
          Syarat & Ketentuan
        </button>
        {" "}serta{" "}
        <button onClick={showPrivasi} type="button" style={{ fontWeight: 700, color: "rgba(11,33,63,0.55)" }} className="hover:text-[#0B213F] transition-colors">
          Kebijakan Privasi
        </button>.
      </p>
    </div>
  );
}
