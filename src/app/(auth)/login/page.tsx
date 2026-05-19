"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import { useLegalModal } from "@/shared/components/providers/LegalModalProvider";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { showSyarat, showPrivasi } = useLegalModal();

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
        setError("Email atau password salah.");
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
    <div className="w-full space-y-7">

      {/* Header */}
      <div className="space-y-1.5">

        <h1 className="font-black tracking-tighter" style={{ fontSize: "28px", color: "#0B213F", lineHeight: 1.1 }}>
          Selamat Datang<br />Kembali
        </h1>
        <p style={{ fontSize: "13px", fontWeight: 500, color: "rgba(11,33,63,0.45)", marginTop: "6px" }}>
          Belum punya akun?{" "}
          <Link href="/register" style={{ color: "#D4AF37", fontWeight: 700 }} className="hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="auth-label">Email atau Username</label>
          <input
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="auth-input"
            placeholder="Masukkan email atau username"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="auth-label" style={{ marginBottom: 0 }}>Kata Sandi</label>
            <Link href="/forgot-password" style={{ fontSize: "11px", fontWeight: 700, color: "#D4AF37" }} className="hover:underline">
              Lupa sandi?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              style={{ paddingRight: "48px" }}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: "rgba(11,33,63,0.35)" }}
            >
              {showPassword ? <EyeOff size={17} strokeWidth={2} /> : <Eye size={17} strokeWidth={2} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 rounded-xl p-3" style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.15)" }}>
            <div className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#dc2626" }}>{error}</p>
          </div>
        )}

        <button type="submit" disabled={isLoading} className="auth-btn-primary">
          {isLoading ? "Memproses..." : "Masuk ke Akun"}
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
          onError={() => toast.error("Google Login Failed")}
          theme="outline"
          shape="pill"
          size="large"
        />
      </div>

      {/* Legal */}
      <p className="text-center" style={{ fontSize: "10.5px", color: "rgba(11,33,63,0.35)", lineHeight: 1.6 }}>
        Dengan masuk, Anda menyetujui{" "}
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