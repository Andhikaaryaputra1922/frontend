"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, BookOpen, Users, Award, PlayCircle,
  CheckCircle, Star, GraduationCap, Clock,
  Shield, Menu, X, MessageCircle, Camera,
  Monitor, TrendingUp
} from "lucide-react";
import { IslamicPanel, IslamicCard } from "@/shared/components/ui/IslamicPanel";
import { CourseCard } from "@/shared/components/ui/CourseCard";

/* ─────────────────────────────────────────
   DESIGN TOKENS
   Navy  : #1A2E44
   Gold  : #E5B54F
   White : #FFFFFF / #FAF9F6
───────────────────────────────────────── */

const HERO_IMAGE = "/images/hero_premium.png";
const FALLBACK_IMG = "https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=2070&auto=format&fit=crop";

/* ── Fade-up animation variant ── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.12 } }),
};

export default function LandingClient() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [playModal, setPlayModal] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif", background: "#FAF9F6", color: "#1A2E44" }}>

      {/* ══════════════════════════════════
          INJECT GLOBAL STYLES
      ══════════════════════════════════ */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700;9..40,800;9..40,900&display=swap');
        * { font-family: 'DM Sans', sans-serif !important; }

        /* underline hover link */
        .nav-link { position:relative; }
        .nav-link::after { content:''; position:absolute; bottom:-4px; left:0; width:0; height:2px; background:#E5B54F; border-radius:9px; transition:width .25s ease; }
        .nav-link:hover::after { width:100%; }

        /* section title */
        .s-label { font-size:10px; font-weight:900; letter-spacing:.22em; text-transform:uppercase; color:#E5B54F; }

        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        .float { animation: floatY 5s ease-in-out infinite; }

        @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
        .shimmer-btn { background-size:200% 100%; }
      `}</style>

      {/* ══════════════════════════════════
          NAVBAR
      ══════════════════════════════════ */}
      <nav className={`fixed top-0 z-[100] w-full transition-all duration-500 bg-[#1A2E44] shadow-xl ${scrolled ? "h-16" : "h-20"}`}>
        <Link href="/" className="absolute left-0 top-1/2 -translate-y-1/2 z-[110]">
          <div className="h-29 w-48 md:h-70 md:w-80">
            <img src="/images/logo.svg" alt="Logo" className="h-full w-full object-contain brightness-0 invert" />
          </div>
        </Link>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-12 relative h-full">
          <div className="hidden items-center gap-10 lg:flex absolute left-1/2 -translate-x-1/2">
            {["Program", "Kursus", "Metodologi", "Testimoni"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="nav-link text-sm font-black uppercase tracking-widest text-white hover:text-[#E5B54F] transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
        <div className="hidden items-center gap-6 lg:flex absolute right-8 top-1/2 -translate-y-1/2 z-[110]">
          <Link href="/login" className="text-sm font-black uppercase tracking-widest text-white hover:text-[#E5B54F] transition-colors">Masuk</Link>
          <Link href="/login" className="group relative overflow-hidden rounded-xl bg-[#E5B54F] px-8 py-3 text-sm font-black text-[#1A2E44] shadow-lg shadow-[#E5B54F]/20 transition-all hover:scale-105 active:scale-95">
            <span className="relative z-10">Register</span>
            <div className="absolute inset-0 translate-y-full bg-white/20 transition-transform group-hover:translate-y-0" />
          </Link>
        </div>
        <button className="lg:hidden ml-auto mr-4 p-2 rounded-xl bg-white/5 text-white" onClick={() => setMenuOpen(!menuOpen)}>
          <AnimatePresence mode="wait">
            <motion.div key={menuOpen ? "close" : "open"} initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.2 }}>
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.div>
          </AnimatePresence>
        </button>
      </nav>

      {/* ══════════════════════════════════
          HERO
      ══════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/images/background-hero.png" alt="Background" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A2E44]/90 via-[#1A2E44]/60 to-transparent" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12 w-full py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">

            {/* Left copy */}
            <motion.div className="space-y-8" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: .1 } } }}>
              <motion.p variants={fadeUp} className="s-label text-[#E5B54F]">
                Haneen Academy — Batch 02 Open
              </motion.p>

              <motion.h1 variants={fadeUp}
                className="text-[56px] md:text-[76px] font-black leading-[1] tracking-tight text-white drop-shadow-2xl">
                Ilmu yang<br />
                <span className="relative inline-block text-[#E5B54F]">
                  Memberkahi
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 10" fill="none">
                    <path d="M2 7 Q75 2 150 7 Q225 12 298 7" stroke="#E5B54F" strokeWidth="3" strokeLinecap="round" fill="none" />
                  </svg>
                </span><br />
                Masa Depan.
              </motion.h1>

              <motion.p variants={fadeUp} className="max-w-md text-lg leading-relaxed text-white/80 font-medium drop-shadow-lg">
                Kurikulum terstruktur dengan pendekatan modern dan Islami. Belajar dari para ahli untuk mencapai keunggulan akademik dan spiritual.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-4 pt-2">
                <Link href="/login"
                  className="group flex items-center gap-3 rounded-2xl bg-[#E5B54F] px-8 py-4 text-sm font-black text-[#1A2E44] shadow-xl shadow-[#E5B54F]/20 transition-all hover:bg-white hover:text-[#1A2E44] hover:-translate-y-1">
                  Daftar Sekarang <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <button onClick={() => setPlayModal(true)}
                  className="flex items-center gap-3 rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur-md px-8 py-4 text-sm font-black text-white shadow-sm hover:bg-white/20 hover:-translate-y-1 transition-all">
                  <PlayCircle size={18} className="text-[#E5B54F]" /> Lihat Video
                </button>
              </motion.div>

              {/* Stats row */}
              <motion.div variants={fadeUp} className="flex items-center gap-8 pt-4 border-t border-white/10">
                {[["4k+", "Alumni Sukses"], ["50+", "Mentor Ahli"], ["4.9★", "Rating"]].map(([val, lbl]) => (
                  <div key={lbl}>
                    <p className="text-2xl font-black text-white">{val}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-0.5">{lbl}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right image */}
            <motion.div className="relative float"
              initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: "easeOut", delay: .3 }}>
              <div className="relative z-10 overflow-hidden rounded-[48px] shadow-[0_40px_80px_-20px_rgba(26,46,68,0.35)] aspect-[4/5]">
                <img src={HERO_IMAGE} alt="Haneen Academy" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A2E44]/50 to-transparent" />
              </div>

              {/* glow */}
              <div className="absolute inset-0 -z-10 bg-[#E5B54F]/15 blur-[80px] rounded-full scale-90" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          HIGHLIGHTS BAR
      ══════════════════════════════════ */}
      <section className="bg-[#1A2E44] py-6">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden">
            {[
              { icon: <Award size={20} />, title: "Terakreditasi", sub: "Sertifikat Resmi" },
              { icon: <Users size={20} />, title: "Grup Eksklusif", sub: "Diskusi Langsung" },
              { icon: <GraduationCap size={20} />, title: "Kurikulum Modern", sub: "Materi Terupdate" },
              { icon: <Monitor size={20} />, title: "LMS Interaktif", sub: "Akses 24/7" },
            ].map((item, i) => (
              <motion.div key={i} whileHover={{ backgroundColor: "rgba(229,181,79,.08)" }}
                className="flex items-center gap-4 bg-[#1A2E44] px-6 py-5 transition-colors cursor-default">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E5B54F]/15 text-[#E5B54F]">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-black text-white">{item.title}</p>
                  <p className="text-[10px] text-white/40 font-semibold mt-0.5">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          COURSES
      ══════════════════════════════════ */}
      <section id="kursus" className="py-28 bg-[#FAF9F6]">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          {/* heading */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
              <p className="s-label mb-3">Program Terpopuler</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#1A2E44]">
                Kursus Unggulan
              </h2>
            </motion.div>
            <Link href="/courses"
              className="group flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[#1A2E44] hover:text-[#E5B54F] transition-colors">
              Lihat Semua <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
          METHODOLOGY
      ══════════════════════════════════ */}
      <section id="metodologi" className="py-28 bg-[#1A2E44] relative overflow-hidden">
        {/* subtle star pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0l4 36h36l-29 21 11 35-22-16-22 16 11-35-29-21h36z' fill='%23FFFFFF'/%3E%3C/svg%3E")`, backgroundSize: "80px 80px" }} />

        <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid gap-16 lg:grid-cols-2 items-center">

            {/* left */}
            <motion.div className="space-y-8" initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ show: { transition: { staggerChildren: .1 } } }}>
              <motion.p variants={fadeUp} className="s-label">Haneen Methodology</motion.p>
              <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
                Metode Belajar<br /><span className="text-[#E5B54F]">Terstruktur</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-base text-white/50 leading-relaxed max-w-lg">
                Menggabungkan kurikulum klasik yang autentik dengan teknologi pembelajaran modern.
              </motion.p>

              <div className="space-y-4 pt-2">
                {[
                  { title: "Kurikulum Terstandar", desc: "Disusun oleh alumni LIPIA & Al-Azhar." },
                  { title: "Sesi Interaktif Langsung", desc: "Tanya jawab dua arah setiap sesi." },
                  { title: "Pantauan Progres Digital", desc: "Dashboard siswa dengan tracking lengkap." },
                ].map((item, i) => (
                  <motion.div key={i} custom={i} variants={fadeUp}
                    whileHover={{ x: 6 }}
                    className="flex gap-5 p-5 rounded-2xl bg-white/5 border border-white/8 hover:bg-white/10 transition-all cursor-default">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E5B54F]/15 text-[#E5B54F]">
                      <CheckCircle size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">{item.title}</p>
                      <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* right card */}
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: .7 }}>
              <div className="rounded-3xl bg-white p-8 shadow-2xl shadow-black/20">
                <p className="s-label mb-6">Keunggulan Kami</p>
                <div className="space-y-3">
                  {[
                    { lbl: "Pengajar Alumni LIPIA & Al-Azhar", icon: <GraduationCap size={18} /> },
                    { lbl: "Sertifikat Kelulusan Resmi", icon: <Award size={18} /> },
                    { lbl: "Akses Rekaman Selamanya", icon: <PlayCircle size={18} /> },
                    { lbl: "Grup Diskusi Eksklusif 24/7", icon: <MessageCircle size={18} /> },
                  ].map((item, i) => (
                    <motion.div key={i} whileHover={{ x: 4, backgroundColor: "#faf9f6" }}
                      className="flex items-center gap-4 p-4 rounded-xl transition-colors cursor-default">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E5B54F]/10 text-[#E5B54F]">
                        {item.icon}
                      </div>
                      <span className="text-sm font-bold text-[#1A2E44]">{item.lbl}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl bg-[#1A2E44] p-6 text-center">
                  <p className="text-xl font-black text-[#E5B54F]">Batch 02</p>
                  <p className="text-xs font-black uppercase tracking-widest text-white/40 mt-1">Pendaftaran Berakhir 3 Hari Lagi</p>
                  <Link href="/login"
                    className="mt-4 block rounded-xl bg-[#E5B54F] py-3 text-sm font-black text-[#1A2E44] hover:brightness-105 transition-all">
                    Daftar Sekarang
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          GALLERY
      ══════════════════════════════════ */}
      <section id="galeri" className="py-28 bg-[#FAF9F6]">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mb-16">
            <p className="s-label mb-3">Momen Berharga</p>
            <h2 className="text-4xl md:text-5xl font-black text-[#1A2E44] tracking-tight">Galeri Akademi</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
                whileHover={{ scale: 1.02 }}
                className={`group relative overflow-hidden rounded-3xl bg-[#1A2E44]/5 ${i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"}`}>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <Camera size={i === 0 ? 40 : 28} className="text-[#1A2E44]/20 group-hover:text-[#E5B54F] transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#1A2E44]/20">Foto {i + 1}</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A2E44] to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-400" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#E5B54F]">Aktivitas</p>
                  <p className="text-sm font-black text-white mt-1">Momen Pembelajaran</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════ */}
      <section id="testimoni" className="py-28 bg-[#1A2E44]">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mb-16">
            <p className="s-label mb-3">Kata Mereka</p>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Testimoni Siswa</h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              { name: "Abdullah", role: "Mahasiswa", text: "Metode Baina Yadaik di Haneen sangat mudah dipahami. Pengajarnya sabar dan detail." },
              { name: "Sarah", role: "Ibu Rumah Tangga", text: "Bisa belajar dari rumah dengan waktu fleksibel sangat membantu aktivitas harian saya." },
              { name: "Yusuf", role: "Karyawan Swasta", text: "Materi terstruktur dan rekaman sangat berguna untuk mengulang di waktu luang." },
            ].map((t, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
                whileHover={{ y: -4 }}
                className="flex flex-col justify-between rounded-3xl bg-white/5 border border-white/8 p-7 transition-all hover:bg-white/10 cursor-default">
                <div>
                  <div className="flex gap-1 text-[#E5B54F] mb-5">
                    {[...Array(5)].map((_, s) => <Star key={s} size={14} fill="currentColor" />)}
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed">"{t.text}"</p>
                </div>
                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/10">
                  <div className="h-10 w-10 rounded-full bg-[#E5B54F]/20 flex items-center justify-center text-[#E5B54F] font-black text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">{t.name}</p>
                    <p className="text-[10px] text-white/30 font-semibold uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          CTA BANNER
      ══════════════════════════════════ */}
      <section className="py-28 bg-[#FAF9F6]">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .7 }}
            className="relative overflow-hidden rounded-[40px] bg-[#1A2E44] p-12 md:p-20 text-center shadow-[0_40px_80px_-20px_rgba(26,46,68,.35)]">
            {/* pattern */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l5 25h25l-20 15 8 20-13-15-13 15 8-20-20-15h25z' fill='%23FFFFFF'/%3E%3C/svg%3E")`, backgroundSize: "60px 60px" }} />
            <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-[#E5B54F]/10 blur-[80px]" />
            <div className="relative z-10">
              <p className="s-label mb-4">Mulai Perjalananmu</p>
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-4">
                Siap Belajar<br /><span className="text-[#E5B54F]">Bersama Kami?</span>
              </h2>
              <p className="text-base text-white/50 max-w-xl mx-auto mb-10">
                Bergabunglah dengan komunitas Haneen Academy dan rasakan transformasi ilmu yang memberkahi.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/login"
                  className="w-full sm:w-auto rounded-2xl bg-[#E5B54F] px-12 py-4 text-sm font-black text-[#1A2E44] shadow-xl shadow-[#E5B54F]/20 hover:brightness-105 hover:-translate-y-1 transition-all">
                  Daftar Sekarang
                </Link>
                <Link href="https://wa.me/6281239551423"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-12 py-4 text-sm font-black text-white hover:bg-white/15 hover:-translate-y-1 transition-all">
                  <MessageCircle size={18} /> Tanya Admin
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════
          FOOTER
      ══════════════════════════════════ */}
      <footer className="bg-[#1A2E44] pt-16 pb-8 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid gap-12 md:grid-cols-4 mb-12">
            <div className="col-span-2 space-y-6">
              <div>
                <p className="text-base font-black uppercase tracking-[.2em] text-white mb-4">Tentang Kami</p>
              </div>
              <p className="text-sm font-medium text-white/50 leading-relaxed max-w-xs">
                Haneen Academy hadir sebagai ruang belajar yang memadukan kedalaman ilmu keislaman dengan kurikulum akademik modern — membentuk generasi yang cerdas, berkarakter, dan berakhlak mulia.
              </p>
            </div>
            <div>
              <p className="text-base font-black uppercase tracking-[.2em] text-white mb-6">Navigasi</p>
              <ul className="space-y-3">
                {["Program", "Kursus", "Metodologi", "Testimoni"].map(item => (
                  <li key={item}><a href={`#${item.toLowerCase()}`} className="text-sm font-semibold text-white/50 hover:text-[#E5B54F] transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-base font-black uppercase tracking-[.2em] text-white mb-6">Support</p>
              <ul className="space-y-3">
                {["Pusat Bantuan", "Syarat & Ketentuan", "Kebijakan Privasi"].map(item => (
                  <li key={item}><a href="#" className="text-sm font-semibold text-white/50 hover:text-[#E5B54F] transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex justify-center items-center pt-8 border-t border-white/8">
            <p className="text-sm font-black uppercase tracking-widest text-white">
              2025 Copyright by Haneen Academy, All Right Reserved
            </p>
          </div>
        </div>
      </footer>

      {/* ══════════════════════════════════
          MOBILE MENU
      ══════════════════════════════════ */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-[#1A2E44] flex flex-col p-8">
            <div className="flex justify-between items-center mb-14">
              <div className="h-10 w-32">
                <img src="/images/logo.svg" alt="Logo" className="h-full w-full object-contain brightness-0 invert" />
              </div>
              <button onClick={() => setMenuOpen(false)} className="p-2 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors">
                <X size={28} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {["Program", "Kursus", "Metodologi", "Testimoni"].map((item, i) => (
                <motion.a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * .07 }}
                  className="rounded-2xl px-5 py-4 text-lg font-black uppercase tracking-widest text-white hover:bg-white/5 hover:text-[#E5B54F] transition-all">
                  {item}
                </motion.a>
              ))}
              <div className="mt-8 space-y-3">
                <Link href="/login" onClick={() => setMenuOpen(false)}
                  className="block w-full rounded-2xl border border-white/15 py-4 text-center text-sm font-black text-white hover:bg-white/5 transition-colors">
                  Masuk
                </Link>
                <Link href="/login" onClick={() => setMenuOpen(false)}
                  className="block w-full rounded-2xl bg-[#E5B54F] py-4 text-center text-sm font-black text-[#1A2E44] hover:brightness-105 transition-all">
                  Register
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
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
            <motion.div initial={{ scale: .9 }} animate={{ scale: 1 }} exit={{ scale: .9 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-3xl aspect-video rounded-3xl bg-[#1A2E44] overflow-hidden shadow-2xl">
              <div className="flex h-full items-center justify-center">
                <p className="text-white/40 font-black uppercase tracking-widest text-sm">Video akan ditambahkan di sini</p>
              </div>
              <button onClick={() => setPlayModal(false)}
                className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                <X size={18} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
