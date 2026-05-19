"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  MoveRight, UsersRound, Trophy, GraduationCap,
  Star, AlignRight, X, MessageSquare, Zap,
  LayoutDashboard, Sparkles, ChevronRight,
  BadgeCheck, Flame
} from "lucide-react";
import { CourseCard } from "@/shared/components/ui/CourseCard";

/* ─────────────────────────────────────────
   DESIGN TOKENS & UTILS
   Navy  : #0B213F
   Gold  : #D4AF37
   White : #FFFFFF / #FAF9F6
───────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.08, ease: [0.25, 1, 0.35, 1] as const } }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function LandingClient() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [playModal, setPlayModal] = useState(false);
  
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroScroll, [0, 1], [0, 200]);
  const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, 0]);
  const videoScale = useTransform(heroScroll, [0, 1], [1, 1.1]);
  const videoRotateX = useTransform(heroScroll, [0, 1], [10, 0]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden selection:bg-[#D4AF37]/30 selection:text-[#0B213F]" style={{ fontFamily: "'DM Sans', sans-serif", background: "#061224", color: "#FAF9F6" }}>
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,800;9..40,900&display=swap');
        * { font-family: 'DM Sans', sans-serif !important; }
        
        .nav-link { position:relative; }
        .nav-link::after { content:''; position:absolute; bottom:-4px; left:0; width:0; height:2px; background:#D4AF37; border-radius:9px; transition:width .3s ease; }
        .nav-link:hover::after { width:100%; }

        .s-label { font-size:11px; font-weight:900; letter-spacing:.25em; text-transform:uppercase; color:#D4AF37; }
        
        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .gold-gradient-text {
          background: linear-gradient(to right, #F3E29F, #D4AF37, #B48E2D);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* ══════════════════════════════════
          NAVBAR
      ══════════════════════════════════ */}
      <nav className={`fixed top-0 z-[100] w-full transition-all duration-500 ${scrolled ? "h-16 bg-[#061224]/80 backdrop-blur-md border-b border-white/5" : "h-24 bg-transparent"}`}>
        <Link href="/" className="absolute left-6 lg:left-12 top-1/2 -translate-y-1/2 z-[110]">
          <img src="/images/logo.svg" alt="Logo" className="h-64 w-auto object-contain brightness-0 invert" />
        </Link>
        <div className="hidden items-center gap-10 lg:flex absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          {["Program", "Metodologi", "Galeri", "Testimoni"].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`}
              className="nav-link text-[11px] font-black uppercase tracking-widest text-white/80 hover:text-white transition-colors">
              {item}
            </a>
          ))}
        </div>
        <div className="hidden items-center gap-6 lg:flex absolute right-6 lg:right-12 top-1/2 -translate-y-1/2 z-[110]">
          <Link href="/login" className="text-[11px] font-black uppercase tracking-widest text-white/80 hover:text-white transition-colors">Masuk</Link>
          <Link href="/login" className="group relative overflow-hidden rounded-full bg-white px-8 py-3 text-[11px] font-black uppercase tracking-widest text-[#061224] transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            <span className="relative z-10 flex items-center gap-2">Daftar <MoveRight size={14} className="group-hover:translate-x-1 transition-transform" /></span>
          </Link>
        </div>
        <button className="lg:hidden absolute right-6 top-1/2 -translate-y-1/2 p-2 rounded-xl glass-panel text-white" onClick={() => setMenuOpen(!menuOpen)}>
          <AnimatePresence mode="wait">
            <motion.div key={menuOpen ? "close" : "open"} initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.2 }}>
              {menuOpen ? <X size={20} /> : <AlignRight size={20} />}
            </motion.div>
          </AnimatePresence>
        </button>
      </nav>

      {/* ══════════════════════════════════
          HERO (ULTRA PREMIUM)
      ══════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen pt-32 pb-20 flex flex-col items-center justify-center overflow-hidden">
        {/* Ambient Background Glows */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#1a3a6e]/40 rounded-[100%] blur-[120px] pointer-events-none" />
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-[#D4AF37]/10 rounded-[100%] blur-[100px] pointer-events-none" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white_20%,transparent_80%)] pointer-events-none" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 flex flex-col items-center text-center px-6 max-w-[1400px] mx-auto w-full">


          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2, ease: [0.25, 1, 0.35, 1] }}
            className="text-[3.5rem] sm:text-[5rem] lg:text-[6.5rem] font-black leading-[1.05] tracking-tighter text-white mb-8">
            Revolusi Belajar<br />
            <span className="gold-gradient-text">dengan Keberkahan</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.35 }}
            className="text-lg sm:text-xl text-white/50 font-medium max-w-2xl leading-relaxed mb-10">
            Haneen Academy memadukan kurikulum Islam klasik dengan teknologi modern. Belajar dari pengajar alumni Timur Tengah di platform interaktif kelas dunia.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto mb-16">
            <Link href="/login" className="w-full sm:w-auto group relative flex items-center justify-center gap-3 bg-[#D4AF37] text-[#061224] px-10 py-5 rounded-2xl font-black text-sm transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(212,175,55,0.3)]">
              Mulai Perjalananmu <MoveRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.65 }}
            className="flex items-center gap-10 border-t border-white/10 pt-10">
            {[["4k+", "Alumni Sukses"], ["50+", "Mentor Ahli"], ["4.9", "Rating Bintang"]].map(([val, lbl]) => (
              <div key={lbl} className="text-center">
                <p className="text-3xl font-black text-white">{val}<span className="text-[#D4AF37]">★</span></p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">{lbl}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* 3D Video / Dashboard Preview */}
        <motion.div 
          style={{ scale: videoScale, rotateX: videoRotateX, perspective: 1000 }}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-20 mt-20 w-full max-w-[1400px] px-6 lg:px-12"
        >
          <div className="relative rounded-[2.5rem] overflow-hidden glass-panel p-2 shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/10 ring-1 ring-white/5" style={{ transformStyle: "preserve-3d" }}>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/10 via-transparent to-[#1a3a6e]/20 opacity-50 mix-blend-overlay" />
            <img src="/images/hero_premium.png" onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2000&auto=format")} alt="Platform Preview" className="w-full h-auto rounded-[2rem] object-cover opacity-90" />

          </div>
        </motion.div>
        

      </section>

      {/* Main Content wrapper with light background */}
      <div className="bg-[#FAF9F6] text-[#061224] relative z-40 rounded-t-[3rem] -mt-10 overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.1)] pt-10">
        
        {/* ══════════════════════════════════
            LOGOS / TRUSTED BY
        ══════════════════════════════════ */}
        <section className="py-16 border-b border-black/5">
          <div className="max-w-[1400px] mx-auto px-6 text-center">
            <p className="s-label text-slate-400 mb-8">Dipercaya oleh Siswa dari Berbagai Institusi</p>
            <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-40 grayscale">
              {["UI", "ITB", "UGM", "Al-Azhar", "LIPIA"].map((logo) => (
                <div key={logo} className="text-xl md:text-2xl font-black tracking-tight">{logo}</div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════
            BENTO GRID FEATURES
        ══════════════════════════════════ */}
        <section id="metodologi" className="py-32">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
            <div className="text-center mb-20 max-w-3xl mx-auto">
              <p className="s-label mb-4">Metodologi Haneen</p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                Ekosistem Belajar<br />yang <span className="gold-gradient-text">Revolusioner.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Box 1: Large */}
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="md:col-span-2 min-h-[360px] relative rounded-[2rem] bg-[#061224] p-10 overflow-hidden text-white group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#1a3a6e] to-transparent opacity-50 rounded-bl-full pointer-events-none transition-transform duration-700 group-hover:scale-110" />
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#D4AF37] mb-8">
                    <LayoutDashboard size={28} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black tracking-tight mb-3">LMS Kelas Dunia</h3>
                    <p className="text-white/50 text-base max-w-md leading-relaxed">Platform belajar yang dirancang khusus untuk kenyamanan Anda. Akses materi, kuis, dan sertifikat di satu tempat.</p>
                  </div>
                </div>
                <div className="absolute right-[-5%] bottom-[-5%] w-[50%] h-[50%] rounded-tl-[2rem] bg-white/5 border-t border-l border-white/10 p-6 flex flex-col gap-3 transform group-hover:-translate-x-3 group-hover:-translate-y-3 transition-transform duration-700">
                  <div className="w-full h-6 bg-white/10 rounded-lg" />
                  <div className="w-3/4 h-6 bg-white/10 rounded-lg" />
                  <div className="w-5/6 h-6 bg-white/10 rounded-lg" />
                </div>
              </motion.div>

              {/* Box 2 */}
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="min-h-[360px] relative rounded-[2rem] bg-white border border-slate-100 p-10 overflow-hidden group shadow-xl shadow-slate-200/50">
                <div className="h-14 w-14 rounded-2xl bg-[#FAF9F6] border border-slate-100 flex items-center justify-center text-[#061224] mb-8">
                   <UsersRound size={28} />
                 </div>
                <h3 className="text-2xl font-black tracking-tight mb-3">Grup Eksklusif</h3>
                <p className="text-slate-500 font-medium leading-relaxed">Diskusi intensif langsung dengan mentor dan teman sekelas via komunitas private yang aktif.</p>
              </motion.div>

              {/* Box 3 */}
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="min-h-[280px] relative rounded-[2rem] bg-gradient-to-br from-[#D4AF37] to-[#B48E2D] p-10 overflow-hidden text-[#061224] group shadow-xl shadow-[#D4AF37]/20">
                <div className="absolute -right-8 -top-8 text-white/20 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                   <Trophy size={140} strokeWidth={1} />
                 </div>
                <div className="relative z-10 flex flex-col justify-end h-full">
                  <h3 className="text-2xl font-black tracking-tight mb-2">Sertifikat Resmi</h3>
                  <p className="text-[#061224]/70 font-semibold leading-relaxed text-sm">Validasi kemampuanmu dengan sertifikat terakreditasi setelah menyelesaikan program.</p>
                </div>
              </motion.div>

              {/* Box 4 */}
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="md:col-span-2 min-h-[280px] relative rounded-[2rem] bg-[#FAF9F6] border border-slate-100 p-10 overflow-hidden group shadow-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                  {[["4k+", "Alumni Sukses", GraduationCap], ["50+", "Pengajar Ahli", UsersRound], ["4.9★", "Rating Platform", Star]].map(([val, lbl, Icon], i) => (
                    <div key={String(lbl)} className="flex items-center gap-5 flex-1">
                      <div className="h-14 w-14 rounded-2xl bg-[#061224]/5 flex items-center justify-center text-[#D4AF37]">
                        <Icon size={24} />
                      </div>
                      <div>
                        <p className="text-3xl font-black text-[#061224]">{val as string}</p>
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-0.5">{lbl as string}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════
            COURSES SECTION
        ══════════════════════════════════ */}
        <section id="program" className="py-32 bg-white border-y border-slate-100">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-20">
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
                <p className="s-label mb-4">Program Terpopuler</p>
                <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                  Kursus Unggulan
                </h2>
              </motion.div>
              <Link href="/courses"
                className="group flex items-center gap-3 text-xs font-black uppercase tracking-widest text-[#061224] hover:text-[#D4AF37] transition-colors pb-4 border-b-2 border-transparent hover:border-[#D4AF37]">
                Lihat Semua Program <MoveRight size={16} className="transition-transform group-hover:translate-x-2" />
              </Link>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  id: "bootcamp-arab", title: "Bootcamp Al Arabiyyah Baina Yadaik Jilid 1", category: "Bahasa Arab",
                  thumbnail: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=1000&auto=format",
                  teacher: { name: "Ustadz Ahmad Al-Hafidz" }, rating: 4.9, students: 1240, price: 399000
                },
                {
                  id: "tahsin-premium", title: "Tahsin & Tajwid Al-Qur'an Intensif", category: "Al-Qur'an",
                  thumbnail: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=1000&auto=format",
                  teacher: { name: "Ustadzah Fatimah" }, rating: 5.0, students: 850, price: 249000
                },
                {
                  id: "shirah-nabawiyah", title: "Shirah Nabawiyah: Meneladani Sang Nabi", category: "Sejarah",
                  thumbnail: "https://images.unsplash.com/photo-1590076247864-106596105f56?q=80&w=1000&auto=format",
                  teacher: { name: "Ustadz Zaid" }, rating: 4.8, students: 2100, price: 199000
                },
              ].map((course, i) => (
                <motion.div key={i} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
                  <CourseCard {...course} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════
            GALLERY (SUPER INTERACTIVE)
        ══════════════════════════════════ */}
        <section id="galeri" className="py-32">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mb-20 text-center max-w-3xl mx-auto">
              <p className="s-label mb-4">Momen Berharga</p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                Galeri <span className="gold-gradient-text">Akademi</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                "https://images.unsplash.com/photo-1577563908411-50cb989766a3?auto=format&fit=crop&q=80&w=1000",
                "https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&q=80&w=1000",
                "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1000",
                "https://images.unsplash.com/photo-1427504494785-319ce51d1541?auto=format&fit=crop&q=80&w=1000",
                "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1000",
                "https://images.unsplash.com/photo-1511629091441-ee46146481b6?auto=format&fit=crop&q=80&w=1000"
              ].map((imgUrl, i) => (
                <motion.div key={i} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
                  className={`group relative overflow-hidden rounded-[2.5rem] bg-[#061224] shadow-2xl ${i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"}`}>
                  <img src={imgUrl} alt={`Gallery ${i}`} className="absolute inset-0 h-full w-full object-cover transition-all duration-[2000ms] ease-out group-hover:scale-110 group-hover:rotate-1" />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-[#061224]/90 via-[#061224]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10">
                    <div className="translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 ease-out flex flex-col gap-4">
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-[10px] font-black uppercase tracking-[.2em] backdrop-blur-md w-max shadow-lg">
                        <Flame size={12} className="text-[#D4AF37]" /> Momen {i + 1}
                      </span>
                      <h3 className={`font-black text-white tracking-tight leading-[1.1] drop-shadow-2xl ${i === 0 ? 'text-4xl md:text-5xl max-w-sm' : 'text-2xl'}`}>
                        Keseruan Belajar<br />di Haneen
                      </h3>
                      {i === 0 && (
                        <div className="mt-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 delay-150">
                          <p className="text-base font-medium text-white/80 leading-relaxed max-w-md">
                            Setiap momen didesain untuk memaksimalkan potensi siswa melalui interaksi yang positif, lingkungan kondusif, dan ilmu yang memberkahi.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-[1500ms] pointer-events-none mix-blend-overlay" style={{ background: 'radial-gradient(circle at top right, rgba(255,255,255,0.4) 0%, transparent 60%)' }} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════
            TESTIMONIALS
        ══════════════════════════════════ */}
        <section id="testimoni" className="py-32 bg-[#061224] text-white">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mb-20 text-center max-w-3xl mx-auto">
              <p className="s-label mb-4">Kata Mereka</p>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight text-white">
                Kisah Sukses <span className="gold-gradient-text">Siswa Kami</span>
              </h2>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: "Abdullah R.", role: "Mahasiswa S1", text: "Metode Baina Yadaik di Haneen sangat mudah dipahami. Dalam 3 bulan saya sudah bisa membaca kitab gundul. Pengajarnya sabar dan sangat detail dalam menjelaskan." },
                { name: "Sarah Amalia", role: "Ibu Rumah Tangga", text: "Belajar dari rumah dengan waktu fleksibel sangat membantu. Saya bisa mengatur sendiri antara urusan keluarga dan belajar tanpa merasa terbebani." },
                { name: "Yusuf Hidayat", role: "Karyawan Swasta", text: "Materi terstruktur dan rekaman setiap sesi sangat membantu untuk mengulang di waktu senggang. Platform LMS-nya juga sangat responsif dan mudah digunakan." },
              ].map((t, i) => (
                <motion.div key={i} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
                  className="group flex flex-col justify-between rounded-[2rem] bg-white/5 border border-white/8 p-8 transition-all hover:bg-white/10 hover:-translate-y-1 duration-300">
                  <div>
                    <div className="flex gap-1 text-[#D4AF37] mb-6">
                      {[...Array(5)].map((_, s) => <Star key={s} size={14} fill="currentColor" />)}
                    </div>
                    <p className="text-white/70 leading-relaxed text-base">"{t.text}"</p>
                  </div>
                  <div className="flex items-center gap-4 mt-8 pt-6 border-t border-white/10">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-[#D4AF37]/30 to-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-black text-base border border-[#D4AF37]/20">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">{t.name}</p>
                      <p className="text-[10px] text-white/30 font-semibold uppercase tracking-widest mt-0.5">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════
            CTA BANNER (PREMIUM)
        ══════════════════════════════════ */}
        <section className="py-32 px-6">
          <div className="mx-auto max-w-[1400px]">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: "easeOut" }}
              className="relative overflow-hidden rounded-[3rem] bg-[#061224] shadow-[0_40px_100px_-20px_rgba(6,18,36,.5)] text-white p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12">
              
              {/* Ambient Backgrounds */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50" />
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/15 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
              
              <div className="relative z-10 max-w-2xl">
                <span className="inline-block px-4 py-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-black uppercase tracking-[.2em] mb-6">
                  Terbuka untuk Umum
                </span>
                <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05] mb-6">
                  Siap Memulai Perjalanan <span className="gold-gradient-text">Ilmu-mu?</span>
                </h2>
                <p className="text-lg text-white/50 leading-relaxed font-medium">
                  Bergabung dengan ribuan siswa lainnya di Haneen Academy. Dapatkan akses ke kurikulum eksklusif, mentor profesional, dan komunitas yang suportif.
                </p>
              </div>

              <div className="relative z-10 flex flex-col gap-4 w-full md:w-auto shrink-0">
                <Link href="/login"
                  className="group flex items-center justify-center gap-3 rounded-2xl bg-[#D4AF37] px-10 py-5 text-sm font-black text-[#061224] shadow-xl shadow-[#D4AF37]/25 hover:brightness-110 hover:-translate-y-1 transition-all duration-300">
                  Daftar Sekarang <MoveRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="https://wa.me/6281239551423"
                  className="group flex items-center justify-center gap-3 rounded-2xl border border-white/10 glass-panel px-10 py-5 text-sm font-black text-white hover:bg-white/10 hover:-translate-y-1 transition-all duration-300">
                  <MessageSquare size={18} className="text-[#D4AF37]" /> Tanya Admin
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <footer className="border-t border-slate-200 pt-20 pb-10">
          <div className="mx-auto max-w-[1400px] px-6 lg:px-12">
            <div className="grid gap-16 md:grid-cols-4 mb-16">
              <div className="col-span-2 space-y-4">
                <p className="text-[11px] font-black uppercase tracking-[.2em] text-[#061224] mb-8">TENTANG KAMI</p>
                <p className="text-slate-500 font-medium leading-relaxed max-w-sm">
                  Membangun generasi cerdas dan berakhlak mulia melalui perpaduan kurikulum Islam autentik dan teknologi modern.
                </p>
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[.2em] text-[#061224] mb-8">Navigasi</p>
                <ul className="space-y-4">
                  {["Program Utama", "Metodologi", "Kisah Sukses", "Artikel Terbaru"].map(item => (
                    <li key={item}><a href="#" className="text-sm font-bold text-slate-500 hover:text-[#D4AF37] transition-colors">{item}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[.2em] text-[#061224] mb-8">Dukungan</p>
                <ul className="space-y-4">
                  {["Pusat Bantuan", "Syarat & Ketentuan", "Kebijakan Privasi", "Hubungi Kami"].map(item => (
                    <li key={item}><a href="#" className="text-sm font-bold text-slate-500 hover:text-[#D4AF37] transition-colors">{item}</a></li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex justify-center pt-8 border-t border-slate-200 text-center">
              <p className="text-[11px] font-black uppercase tracking-[.2em] text-slate-400">
                © 2026 Haneen Academy. All Rights Reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* ══════════════════════════════════
          MOBILE MENU
      ══════════════════════════════════ */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-[#061224]/95 backdrop-blur-xl flex flex-col p-8">
            <div className="flex justify-between items-center mb-16">
              <img src="/images/logo.svg" alt="Logo" className="h-10 w-auto brightness-0 invert" />
              <button onClick={() => setMenuOpen(false)} className="p-2 rounded-xl glass-panel text-white hover:bg-white/10 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {["Program", "Metodologi", "Galeri", "Testimoni"].map((item, i) => (
                <motion.a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  className="text-2xl font-black tracking-tight text-white/70 hover:text-white transition-colors py-2">
                  {item}
                </motion.a>
              ))}
              <div className="mt-12 space-y-4">
                <Link href="/login" onClick={() => setMenuOpen(false)}
                  className="block w-full rounded-2xl glass-panel py-5 text-center text-sm font-black text-white hover:bg-white/10 transition-colors">
                  Masuk Akun
                </Link>
                <Link href="/login" onClick={() => setMenuOpen(false)}
                  className="block w-full rounded-2xl bg-[#D4AF37] py-5 text-center text-sm font-black text-[#061224] hover:brightness-110 transition-all shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                  Mulai Sekarang
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════
          VIDEO MODAL
      ══════════════════════════════════ */}
      <AnimatePresence>
        {playModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPlayModal(false)}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-[#061224]/80 backdrop-blur-lg p-6">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-4xl aspect-video rounded-[2.5rem] bg-black overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10">
              <div className="flex h-full items-center justify-center">
                <p className="text-white/40 font-black uppercase tracking-[.2em] text-xs">Video Player Demo</p>
              </div>
              <button onClick={() => setPlayModal(false)}
                className="absolute top-6 right-6 h-12 w-12 rounded-full glass-panel flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10">
                <X size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
