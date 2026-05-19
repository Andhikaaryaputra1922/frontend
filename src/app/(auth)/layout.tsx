"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useLegalModal } from "@/shared/components/providers/LegalModalProvider";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  const [wordIndex, setWordIndex] = useState(0);

  const loginWords = ["Gemilang", "Berkah", "Cerdas", "Berakhlak"];
  const registerWords = ["Komunitas", "Ekosistem", "Keluarga", "Generasi"];
  const words = isLogin ? loginWords : registerWords;

  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [words]);

  const { showSyarat, showPrivasi } = useLegalModal();
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&family=DM+Sans:wght@400;500;700;800;900&display=swap');
        .font-latin { font-family: 'Playfair Display', serif; font-style: italic; }
        * { font-family: 'DM Sans', sans-serif; }

        .auth-input {
          width: 100%;
          background: rgba(11, 33, 63, 0.04);
          border: 1.5px solid rgba(11, 33, 63, 0.1);
          border-radius: 14px;
          padding: 14px 18px;
          font-size: 14px;
          font-weight: 500;
          color: #0B213F;
          transition: all 0.2s ease;
          outline: none;
        }
        .auth-input::placeholder { color: rgba(11, 33, 63, 0.3); }
        .auth-input:focus {
          border-color: #D4AF37;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.08);
        }
        .auth-label {
          display: block;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(11, 33, 63, 0.4);
          margin-bottom: 8px;
        }
        .auth-btn-primary {
          width: 100%;
          background: linear-gradient(135deg, #0B213F 0%, #122d55 100%);
          color: #fff;
          border: none;
          border-radius: 14px;
          padding: 16px;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.25s ease;
          box-shadow: 0 8px 24px rgba(11, 33, 63, 0.2);
          position: relative;
          overflow: hidden;
        }
        .auth-btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(212,175,55,0.15) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .auth-btn-primary:hover::after { opacity: 1; }
        .auth-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 12px 32px rgba(11, 33, 63, 0.3); }
        .auth-btn-primary:active { transform: translateY(0); }
        .auth-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
      `}</style>

      <main className="flex min-h-screen relative overflow-hidden" style={{ background: "#F5F4F0" }}>
        <div className={`flex w-full min-h-screen transition-all duration-700 ${isLogin ? "flex-row" : "flex-row-reverse"}`}>

          {/* ── Branding Panel (Navy) ── */}
          <motion.section
            layout
            layoutId="auth-branding"
            transition={{ type: "spring", stiffness: 120, damping: 20, mass: 1 }}
            className="relative hidden w-[55%] flex-col justify-between overflow-hidden lg:flex z-20"
            style={{ background: "linear-gradient(145deg, #061224 0%, #0B213F 50%, #0d2847 100%)" }}
          >
            {/* Dot grid pattern */}
            <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
              style={{ backgroundImage: "radial-gradient(circle, #D4AF37 1px, transparent 1px)", backgroundSize: "28px 28px" }}
            />

            {/* Gold glow blobs */}
            <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)" }}
            />
            <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)" }}
            />



            {/* Full vertical layout: logo top, content middle, stats bottom */}
            <div className="relative z-10 flex flex-col justify-between h-full px-12 py-14">



              {/* Middle: main heading — vertically centered */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? "login-content" : "register-content"}
                  initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -24, filter: "blur(12px)" }}
                  transition={{ duration: 0.5, ease: [0.25, 1, 0.35, 1] }}
                >
                  <h2 className="font-black leading-[1.0] tracking-tighter text-white" style={{ fontSize: "clamp(3.2rem, 5.5vw, 6rem)" }}>
                    {isLogin ? (
                      <>
                        Menuju<br />Masa Depan{" "}
                        <div className="inline-flex relative" style={{ height: "1.05em", minWidth: "4.5em", verticalAlign: "bottom" }}>
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={words[wordIndex]}
                              initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
                              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                              exit={{ opacity: 0, y: -16, filter: "blur(8px)" }}
                              transition={{ duration: 0.35, ease: "circOut" }}
                              className="absolute left-0 font-latin"
                              style={{ color: "#D4AF37" }}
                            >
                              {words[wordIndex]}
                            </motion.span>
                          </AnimatePresence>
                        </div>
                        <br />
                        <span style={{ color: "rgba(255,255,255,0.4)" }}>Bersama Al-Qur'an.</span>
                      </>
                    ) : (
                      <>
                        Bergabung<br />dengan{" "}
                        <div className="inline-flex relative" style={{ height: "1.05em", minWidth: "5em", verticalAlign: "bottom" }}>
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={words[wordIndex]}
                              initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
                              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                              exit={{ opacity: 0, y: -16, filter: "blur(8px)" }}
                              transition={{ duration: 0.35, ease: "circOut" }}
                              className="absolute left-0 font-latin"
                              style={{ color: "#D4AF37" }}
                            >
                              {words[wordIndex]}
                            </motion.span>
                          </AnimatePresence>
                        </div>
                        <br />
                        <span style={{ color: "rgba(255,255,255,0.4)" }}>Belajar Terbaik.</span>
                      </>
                    )}
                  </h2>
                </motion.div>
              </AnimatePresence>

              {/* Bottom: stats */}
              <div className="flex items-end gap-10 pt-8" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                {[["4k+", "Alumni Sukses"], ["50+", "Pengajar Ahli"], ["4.9★", "Rating Platform"]].map(([val, lbl]) => (
                  <div key={lbl}>
                    <p className="font-black" style={{ fontSize: "26px", lineHeight: 1, color: "#fff" }}>{val}</p>
                    <p style={{ fontSize: "9px", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginTop: "5px" }}>{lbl}</p>
                  </div>
                ))}
              </div>

            </div>

            {/* Footer Info */}
            <div className="relative z-30 px-12 pb-10 flex items-center justify-between" style={{ fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.3)" }}>
              <p>© 2026 Haneen Academy</p>
              <div className="flex gap-5">
                <button onClick={showSyarat} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 font-semibold outline-none" style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>
                  Syarat & Ketentuan
                </button>
                <button onClick={showPrivasi} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 font-semibold outline-none" style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>
                  Kebijakan Privasi
                </button>
              </div>
            </div>
          </motion.section>

          {/* ── Content Panel (Form) ── */}
          <motion.section
            layout
            layoutId="auth-content"
            transition={{ type: "spring", stiffness: 120, damping: 20, mass: 1 }}
            className="flex w-full flex-col items-center justify-center lg:w-[45%] z-10 relative"
            style={{ background: "#F5F4F0" }}
          >
            {/* Subtle top logo for mobile */}
            <div className="lg:hidden absolute top-8 left-1/2 -translate-x-1/2">
              <img src="/images/logo.svg" alt="Haneen Academy" className="h-10 w-auto object-contain"
                style={{ filter: "brightness(0) saturate(0) brightness(0.3)" }} />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -16, filter: "blur(8px)" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="w-full max-w-[400px] px-6"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </motion.section>

        </div>
      </main>
    </GoogleOAuthProvider>
  );
}
