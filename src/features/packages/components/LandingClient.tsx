"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, BookOpen, Users, Award, PlayCircle,
  CheckCircle, Star, GraduationCap, Clock, Zap,
  Shield, Menu, X, MessageCircle, Camera,
  Book, Monitor, Calendar, Check
} from "lucide-react";
import { IslamicPanel, IslamicCard } from "@/shared/components/ui/IslamicPanel";

// Premium Hero Image generated (User needs to move this to public/hero.png)
const HERO_IMAGE = "/hero.png";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=2070&auto=format&fit=crop";

export default function LandingClient() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-[#0F172A] selection:bg-[#1A2E44] selection:text-[#E5B54F]">
      
      {/* Navigation */}
      <nav className={`fixed top-0 z-[100] w-full transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-lg shadow-sm py-3" : "bg-transparent py-5"
      }`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-12">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F172A] text-white shadow-lg transition-transform group-hover:rotate-12">
              <BookOpen size={20} />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">
              HANEEN <span className="text-[#E5B54F]">ACADEMY</span>
            </span>
          </Link>

          <div className="hidden items-center gap-10 md:flex">
            {["Program", "Kurikulum", "Testimoni", "FAQ"].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-[#1A2E44] transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-[#0F172A]">Masuk</Link>
            <Link 
              href="/login" 
              className="rounded-full bg-[#1A2E44] px-7 py-3 text-sm font-bold text-white shadow-xl shadow-slate-200 hover:bg-[#E5B54F] hover:text-[#1A2E44] transition-all active:scale-95"
            >
              Daftar Sekarang
            </Link>
          </div>

          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32">
        {/* Background Decorative */}
        <div className="absolute top-0 right-0 -z-10 h-[800px] w-[800px] rounded-full bg-[#8B0000]/5 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 -z-10 h-[600px] w-[600px] rounded-full bg-blue-500/5 blur-[100px]" />

        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            
            <div className="space-y-8 animate-in fade-in slide-in-from-left-10 duration-1000">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#1A2E44]/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-[#1A2E44]">
                <Zap size={14} className="text-[#E5B54F]" /> Pendaftaran Bootcamp Batch 02
              </div>
              
              <h1 className="font-serif text-5xl md:text-7xl font-black leading-[1.1] tracking-tight">
                AL ARABIYYAH<br />
                <span className="text-[#E5B54F]">BAINA YADAIK</span>
              </h1>
              
              <p className="max-w-lg text-lg leading-relaxed text-slate-600">
                Belajar Bahasa Arab dengan metode terbaik, terstruktur, dan sesuai kebutuhanmu. 
                Program intensif khusus pendaftar <span className="font-bold text-[#0F172A]">JILID 1 (BATCH 02)</span>.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link 
                  href="/login" 
                  className="group flex items-center gap-3 rounded-2xl bg-[#1A2E44] px-8 py-4 text-sm font-black text-white shadow-2xl shadow-slate-300 transition-all hover:bg-[#E5B54F] hover:text-[#1A2E44] hover:-translate-y-1 active:scale-95"
                >
                  Join Bootcamp Sekarang <ArrowRight className="transition-transform group-hover:translate-x-1" size={18} />
                </Link>
                <div className="flex items-center gap-4 rounded-2xl bg-white border border-slate-100 p-2 pr-6 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                    <Book size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bonus Khusus</p>
                    <p className="text-xs font-bold text-slate-700">Gratis E-Book (Rp 150rb)</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-6">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-slate-200" />
                  ))}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#8B0000] text-[10px] font-bold text-white">+4k</div>
                </div>
                <p className="text-xs font-medium text-slate-400">Telah bergabung bersama alumni LIPIA & S2 PBA</p>
              </div>
            </div>

            <div className="relative animate-in fade-in zoom-in-95 duration-1000">
              <div className="relative z-10 overflow-hidden rounded-[40px] shadow-2xl bg-slate-100 aspect-video md:aspect-square flex items-center justify-center">
                <img 
                  src={HERO_IMAGE} 
                  alt="Learning Arabic" 
                  className="w-full h-full object-cover transform transition-transform hover:scale-105 duration-700" 
                  onError={(e) => {
                    e.currentTarget.src = FALLBACK_IMAGE;
                  }}
                />
              </div>
              {/* Floating Badge */}
              <div className="absolute -right-8 -top-8 z-20 h-32 w-32 animate-bounce items-center justify-center rounded-full bg-[#E5B54F] p-4 shadow-xl flex flex-col text-center">
                <p className="text-[10px] font-black uppercase text-[#1A2E44] leading-tight">Kuota<br/>Terbatas</p>
                <div className="mt-1 h-px w-8 bg-[#1A2E44]/30" />
                <p className="mt-1 text-[8px] font-bold text-[#1A2E44] leading-tight">Batch 02 Segera Dimulai!</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Apa yang Kamu Dapatkan */}
      <section id="program" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="mb-16 text-center">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[#8B0000] mb-3">Benefits</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">APA YANG <span className="text-slate-400">KAMU DAPATKAN?</span></h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "HABIS 1 BUKU DALAM 2 BULAN", icon: <BookOpen />, desc: "Target kurikulum terukur untuk pemahaman maksimal." },
              { title: "PENGAJAR PROFESIONAL", icon: <GraduationCap />, desc: "Alumni LIPIA & S2 Pendidikan Bahasa Arab." },
              { title: "PERTEMUAN 4X PER-MINGGU", icon: <Calendar />, desc: "Intensitas belajar tinggi untuk hasil yang nyata." },
              { title: "GRATIS KONSULTASI 24 JAM", icon: <MessageCircle />, desc: "Bimbingan langsung via grup eksklusif." },
              { title: "GRATIS MATERI & REKAMAN", icon: <PlayCircle />, desc: "Akses materi kapan saja tanpa batas waktu." },
              { title: "2 SERTIFIKAT RESMI", icon: <Award />, desc: "Sertifikat kehadiran dan sertifikat kelulusan." },
            ].map((item, i) => (
              <IslamicCard key={i}>
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F9F6EE] text-[#1A2E44] shadow-sm transition-transform group-hover:scale-110 group-hover:bg-[#1A2E44] group-hover:text-[#E5B54F]">
                  {item.icon}
                </div>
                <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-[#1A2E44] leading-snug">{item.title}</h3>
                <p className="text-xs leading-relaxed text-slate-500">{item.desc}</p>
              </IslamicCard>
            ))}
          </div>
        </div>
      </section>

      {/* Investasi Section */}
      <section className="bg-[#0F172A] py-24 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#8B0000]/10 skew-x-12 transform translate-x-32" />
        
        <div className="mx-auto max-w-7xl px-6 md:px-12 relative z-10">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
                INVESTASI TERBAIK<br />
                <span className="text-[#8B0000]">UNTUK DIRIMU</span>
              </h2>
              <p className="text-slate-400 leading-relaxed">
                Bergabunglah dengan ratusan pendaftar lainnya di Batch 02. Dapatkan akses penuh ke materi terstruktur dan bimbingan pengajar ahli.
              </p>
              
              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: "Kelas Interaktif", icon: <Users /> },
                  { label: "Materi Terstruktur", icon: <Book /> },
                  { label: "Akses 24 Jam", icon: <Clock /> },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-[#8B0000]">
                      {item.icon}
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <IslamicPanel variant="white" className="p-10 md:p-16 border-t-4 border-[#E5B54F]">
                <p className="text-center text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Harga Spesial Batch 02</p>
                <div className="flex items-center justify-center gap-2 mb-2 text-[#1A2E44]">
                  <span className="text-4xl font-black">Rp</span>
                  <span className="text-7xl font-black tracking-tighter">399.000</span>
                </div>
                <p className="text-center text-sm font-bold text-[#E5B54F] mb-8">(40x Pertemuan Intensif)</p>
                
                <ul className="mb-10 space-y-4">
                  {["Akses Selamanya", "Grup WhatsApp Eksklusif", "Sertifikat Digital", "Free Konsultasi"].map(t => (
                    <li key={t} className="flex items-center gap-3 text-sm font-bold">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <Check size={12} />
                      </div>
                      {t}
                    </li>
                  ))}
                </ul>

                <Link 
                  href="/login" 
                  className="block w-full rounded-2xl bg-[#0F172A] py-5 text-center text-sm font-black uppercase tracking-widest text-white shadow-xl hover:bg-[#8B0000] transition-all active:scale-95"
                >
                  Ambil Slot Sekarang
                </Link>
              </IslamicPanel>
            </div>
          </div>
        </div>
      </section>

      {/* Jadwal Belajar */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FAF9F6] text-[#8B0000] mb-6">
            <Calendar size={32} />
          </div>
          <h2 className="text-3xl font-black mb-12">JADWAL BELAJAR</h2>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Hari", value: "Senin – Jum’at", icon: <Calendar /> },
              { label: "Waktu", value: "19.00 – 20.00 WIB", icon: <Clock /> },
              { label: "Platform", value: "Google Meet / Zoom", icon: <Monitor /> },
              { label: "Durasi", value: "60 Menit per Sesi", icon: <Clock /> },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-5 rounded-3xl bg-[#FAF9F6] p-6 text-left border border-transparent hover:border-[#8B0000]/10 transition-colors">
                <div className="text-[#8B0000]">{item.icon}</div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                  <p className="text-base font-bold text-slate-800">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 rounded-3xl bg-[#0F172A] p-8 text-white">
            <p className="text-sm font-medium leading-relaxed italic">
              "Buku yang digunakan belajar: <span className="text-amber-400 font-bold">ARABIYYAH BAINA YADAIK</span>"
            </p>
          </div>
        </div>
      </section>

      {/* Let's Join Us / Contact */}
      <section className="bg-[#FAF9F6] py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-12 text-center">
          <h2 className="text-3xl font-black mb-16 tracking-[0.2em] uppercase">LET'S JOIN US!</h2>
          
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div className="flex flex-col items-center gap-6 rounded-[40px] bg-white p-12 shadow-xl">
              <div className="h-48 w-48 bg-slate-100 rounded-2xl flex items-center justify-center border-4 border-dashed border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">QR CODE DISINI</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-black uppercase tracking-widest text-[#0F172A]">SCAN QR CODE</p>
                <p className="text-xs text-slate-400">Untuk info pendaftaran lebih lanjut</p>
              </div>
            </div>

            <div className="space-y-6 text-left">
              <div className="flex items-center gap-6 rounded-3xl bg-white p-8 shadow-md hover:shadow-xl transition-shadow">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600 shadow-sm">
                  <MessageCircle size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">WhatsApp Admin</p>
                  <p className="text-lg font-black text-slate-800">0812 3955 1423 (MINHA)</p>
                </div>
              </div>

              <div className="flex items-center gap-6 rounded-3xl bg-white p-8 shadow-md hover:shadow-xl transition-shadow">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-pink-600 shadow-sm">
                  <Camera size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Instagram</p>
                  <p className="text-lg font-black text-slate-800">@haneen_arabic</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-[#0F172A] rounded-lg flex items-center justify-center text-white">
                <BookOpen size={16} />
              </div>
              <span className="font-black tracking-widest text-sm uppercase">Haneen Academy</span>
            </div>
            
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">© 2026 SEMUA HAK DILINDUNGI</p>
            
            <div className="flex items-center gap-6">
              <a href="#" className="text-slate-400 hover:text-[#8B0000] transition-colors"><Camera size={18} /></a>
              <a href="#" className="text-slate-400 hover:text-[#8B0000] transition-colors"><PlayCircle size={18} /></a>
              <a href="#" className="text-slate-400 hover:text-[#8B0000] transition-colors"><MessageCircle size={18} /></a>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[110] bg-white p-6 animate-in slide-in-from-top duration-300">
          <div className="flex justify-end mb-12">
            <button onClick={() => setMenuOpen(false)}><X size={32} /></button>
          </div>
          <div className="flex flex-col gap-8 text-center">
            {["Program", "Kurikulum", "Testimoni", "FAQ"].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                onClick={() => setMenuOpen(false)}
                className="text-2xl font-black uppercase tracking-widest text-slate-800"
              >
                {item}
              </a>
            ))}
            <div className="pt-12 space-y-4">
              <Link href="/login" className="block w-full py-5 rounded-2xl bg-slate-100 font-bold">Masuk</Link>
              <Link href="/login" className="block w-full py-5 rounded-2xl bg-[#0F172A] text-white font-bold">Daftar Sekarang</Link>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
