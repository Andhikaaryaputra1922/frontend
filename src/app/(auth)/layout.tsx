"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { GoogleOAuthProvider } from "@react-oauth/google";

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

  return (
    <GoogleOAuthProvider clientId={(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "").trim()}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&display=swap');
        .font-latin {
          font-family: 'Playfair Display', serif;
          font-style: italic;
        }
      `}</style>
      <main className="flex min-h-screen relative overflow-hidden bg-white">
        <div className={`flex w-full min-h-screen transition-all duration-700 ${isLogin ? "flex-row" : "flex-row-reverse"}`}>
          
          {/* ── Branding Panel (Navy) ── */}
          <motion.section 
            layout
            layoutId="auth-branding"
            transition={{ 
              type: "spring", 
              stiffness: 120, 
              damping: 20, 
              mass: 1 
            }}
            className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#1A2E44] p-12 lg:flex z-20"
          >
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

            {/* Center Content */}
            <div className="relative z-10 my-auto w-full max-w-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? "login-content" : "register-content"}
                  initial={{ opacity: 0, x: isLogin ? -30 : 30, filter: "blur(10px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: isLogin ? 30 : -30, filter: "blur(10px)" }}
                  transition={{ duration: 0.4, ease: "circOut" }}
                >
                  <div className="mb-8 h-2 w-20 rounded-full bg-[#E5B54F]" />
                  <h2 className="text-6xl font-black leading-[0.9] tracking-tighter text-white lg:text-8xl">
                    {isLogin ? (
                      <>
                        Menuju Masa Depan{" "}
                        <div className="inline-flex relative h-[1em] min-w-[5em]">
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={words[wordIndex]}
                              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                              transition={{ duration: 0.4, ease: "circOut" }}
                              className="absolute left-0 text-[#E5B54F] font-latin lowercase"
                            >
                              {words[wordIndex]}
                            </motion.span>
                          </AnimatePresence>
                        </div>
                        <br />
                        Bersama Al-Qur'an.
                      </>
                    ) : (
                      <>
                        Bergabunglah dengan{" "}
                        <div className="inline-flex relative h-[1em] min-w-[6em]">
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={words[wordIndex]}
                              initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                              transition={{ duration: 0.4, ease: "circOut" }}
                              className="absolute left-0 text-[#E5B54F] font-latin lowercase"
                            >
                              {words[wordIndex]}
                            </motion.span>
                          </AnimatePresence>
                        </div>
                        <br />
                        Belajar Terbaik.
                      </>
                    )}
                  </h2>
                  <p className="mt-10 text-xl font-medium text-white/50 leading-relaxed max-w-xl">
                    {isLogin ? (
                      <>
                        Platform bimbingan belajar terbaik untuk persiapan{" "}
                        <span className="text-white font-bold">UTBK</span>,{" "}
                        <span className="text-white font-bold">TKA</span>, dan kurikulum sekolah dengan{" "}
                        <span className="text-[#E5B54F] font-latin text-2xl lowercase">pendekatan Islami</span>.
                      </>
                    ) : (
                      <>
                        Dapatkan akses ke{" "}
                        <span className="text-white font-bold">materi eksklusif</span>,{" "}
                        <span className="text-white font-bold">tryout intensif</span>, dan bimbingan langsung dari para{" "}
                        <span className="text-[#E5B54F] font-latin text-2xl lowercase">pengajar berpengalaman</span>.
                      </>
                    )}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer Info */}
            <div className="relative z-10 flex items-center justify-between text-sm font-medium text-white/40">
              <p>© 2026 Haneen Academy</p>
              <div className="flex gap-4">
                <span className="hover:text-white transition-colors cursor-pointer">{isLogin ? "Panduan" : "Syarat"}</span>
                <span className="hover:text-white transition-colors cursor-pointer">{isLogin ? "Bantuan" : "Privasi"}</span>
              </div>
            </div>
          </motion.section>

          {/* ── Content Panel (White Form) ── */}
          <motion.section 
            layout
            layoutId="auth-content"
            transition={{ 
              type: "spring", 
              stiffness: 120, 
              damping: 20, 
              mass: 1 
            }}
            className="flex w-full flex-col items-center justify-center bg-white p-8 lg:w-1/2 z-10"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.98, filter: "blur(8px)" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full flex flex-col items-center justify-center"
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
