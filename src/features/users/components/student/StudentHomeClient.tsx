"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  materialsCount?: number;
}

export default function StudentHomeClient() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/packages")
      .then(r => r.json())
      .then(data => {
        // Map data or use mock if empty to show the '100% similar' layout
        const list = data.packages || [];
        if (list.length === 0) {
           setPackages([
             {
               id: "1",
               name: "BUNDLING 3 TO FULLTEST SNBT 2026 (PART 27, 28, 29)",
               description: "Prediksi soal UTBK 2026 berdasarkan pengalaman para peserta. Berisi 3 Paket Try Out Fulltest dengan soal HOTS.",
               price: 15000,
               originalPrice: 60000,
               image: "https://images.unsplash.com/photo-1627556704302-624286467c65?auto=format&fit=crop&q=80&w=800",
               materialsCount: 7
             },
             {
               id: "2",
               name: "TO UTBK 2026 PART 29 | FULLTEST",
               description: "Prediksi soal UTBK 2026 berdasarkan pengalaman para peserta.",
               price: 12000,
               originalPrice: 25000,
               image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800",
               materialsCount: 7
             },
             {
               id: "3",
               name: "TO UTBK 2026 PART 28 | FULLTEST",
               description: "Prediksi soal UTBK 2026 berdasarkan pengalaman para peserta.",
               price: 12000,
               originalPrice: 25000,
               image: "https://images.unsplash.com/photo-1454165833767-027eeef1593e?auto=format&fit=crop&q=80&w=800",
               materialsCount: 7
             },
             {
               id: "4",
               name: "TO UTBK 2026 PART 27 | FULLTEST",
               description: "Prediksi soal UTBK 2026 berdasarkan pengalaman para peserta.",
               price: 12000,
               originalPrice: 25000,
               image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
               materialsCount: 7
             }
           ]);
        } else {
           setPackages(list.map((p: any) => ({
             ...p,
             originalPrice: p.price * 1.5, // Mocking discount for UI similarity
             materialsCount: 7
           })));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#FDFDFD] pb-20">
      
      {/* ── BANNER HERO ────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-6 md:px-10 pt-6">
        <div className="relative aspect-[21/9] md:aspect-[3/1] w-full overflow-hidden rounded-[24px] md:rounded-[40px] shadow-2xl shadow-red-900/10">
          <img 
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=2000" 
            alt="Tryout Banner" 
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#8B0000]/80 to-transparent flex flex-col justify-center px-12 md:px-24">
             <div className="bg-[#E5B54F] self-start px-4 py-1 rounded-full mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#8B0000]">Telah Tersedia!</span>
             </div>
             <h1 className="text-4xl md:text-7xl font-black text-white leading-tight tracking-tighter">TRYOUT TKA</h1>
             <p className="text-white/80 text-lg md:text-2xl font-bold mt-2 uppercase tracking-widest">Siapkan diri untuk persiapan TKA</p>
             <div className="mt-8">
                <button className="bg-white text-[#8B0000] px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:bg-[#E5B54F] transition-all">Daftar Sekarang</button>
             </div>
          </div>
        </div>
      </section>

      {/* ── RECOMMENDATION SECTION ────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-6 md:px-10 mt-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-[#1A2E44]">Rekomendasi Untukmu!</h2>
          <Link href="/student/packages" className="flex items-center gap-1 text-sm font-black text-[#8B0000] hover:translate-x-1 transition-transform">
             Lainnya <ChevronRight size={18} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[3/4] rounded-[32px] bg-slate-100 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {packages.map((pkg) => (
              <div key={pkg.id} className="group flex flex-col bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                
                {/* Product Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={pkg.image} alt={pkg.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                    <div className="text-blue-500"><FileText size={14} strokeWidth={3} /></div>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">{pkg.materialsCount || 7} Materi</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col">
                  <h3 className="text-sm font-black text-[#1A2E44] line-clamp-2 leading-snug mb-3 uppercase tracking-tight">{pkg.name}</h3>
                  <p className="text-[11px] font-medium text-slate-400 line-clamp-2 mb-6 flex-1">{pkg.description}</p>
                  
                  {/* Pricing */}
                  <div className="flex flex-col gap-1 mb-6">
                    <div className="flex items-center gap-2">
                       <span className="bg-green-100 text-green-600 text-[9px] font-black px-2 py-0.5 rounded-md">
                          {Math.round(((pkg.originalPrice || 0) - pkg.price) / (pkg.originalPrice || 1) * 100)}%
                       </span>
                       <span className="text-[11px] font-bold text-slate-300 line-through">Rp {pkg.originalPrice?.toLocaleString("id-ID")}</span>
                    </div>
                    <p className="text-xl font-black text-[#8B0000]">Rp {pkg.price.toLocaleString("id-ID")}</p>
                  </div>

                  {/* Action */}
                  <Link 
                    href={`/student/packages/${pkg.id}`}
                    className="w-full py-3.5 rounded-2xl bg-[#8B0000] text-center text-[11px] font-black text-white uppercase tracking-[0.2em] shadow-lg shadow-red-900/20 hover:bg-red-800 transition-all active:scale-[0.98]"
                  >
                    Selengkapnya
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── ADDITIONAL CTA / FOOTER INFO ──────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-6 md:px-10 mt-24">
         <div className="bg-[#1A2E44] rounded-[40px] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-xl text-center md:text-left">
               <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">Mulai Perjalanan Belajarmu Sekarang!</h2>
               <p className="text-white/60 mt-4 font-bold uppercase tracking-widest text-sm">Bergabunglah dengan ribuan siswa lainnya di Haneen Academy.</p>
            </div>
            <button className="bg-[#E5B54F] text-[#1A2E44] px-10 py-5 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-amber-900/20">
               Beli Paket Pertama
            </button>
         </div>
      </section>

    </main>
  );
}
