"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, ChevronRight } from "lucide-react";
import Link from "next/link";

interface StorePackage {
  id: string;
  name: string;
  description: string | null;
  price: number;
  defaultLessonLimit: number;
  packageCourses: {
    lessonLimit: number | null;
    course: {
      id: string;
      title: string;
      category: string;
      thumbnailUrl: string | null;
    };
  }[];
}

export default function PackageStorePage() {
  const [packages, setPackages] = useState<StorePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshData = () => {
    setLoading(true);
    fetch("/api/packages/store", { credentials: "include" })
      .then((res) => res.json())
      .then((storeData) => {
        const mapped = (storeData.packages || []).map((p: any) => ({
          ...p,
          price: Number(p.price)
        }));
        setPackages(mapped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(p);

  return (
    <main className="min-h-screen bg-[#FDFDFD] pb-20">
      
      {/* ── BANNER HERO ────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-4 md:px-10 pt-6">
        <div className="relative min-h-[400px] md:min-h-0 md:aspect-[3/1] w-full overflow-hidden rounded-[24px] md:rounded-[40px] shadow-2xl shadow-red-900/10 flex flex-col justify-center">
          <img 
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=2000" 
            alt="Katalog Banner" 
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="relative z-10 bg-gradient-to-r from-[#8B0000]/90 via-[#8B0000]/70 to-transparent flex flex-col justify-center px-6 py-12 md:px-24 md:py-0 w-full h-full">
             <div className="bg-[#E5B54F] self-start px-4 py-1.5 rounded-full mb-4 md:mb-6">
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#8B0000]">Katalog Tersedia</span>
             </div>
             <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tighter">PILIH PAKET<br/>SUKSESMU</h1>
             <p className="text-white/80 text-xs sm:text-sm md:text-xl font-bold mt-4 uppercase tracking-[0.15em] max-w-xs sm:max-w-md md:max-w-xl leading-relaxed">
               Bergabunglah dengan ribuan siswa yang telah berhasil menembus PTN Impian bersama kurikulum terbaik.
             </p>
          </div>
        </div>
      </section>

      {/* ── CATALOG SECTION ────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-6 md:px-10 mt-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-[#1A2E44]">Katalog Paket Belajar</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[3/4] rounded-[32px] bg-slate-100 animate-pulse" />)}
          </div>
        ) : packages.length === 0 ? (
          <div className="rounded-[40px] border border-dashed border-slate-200 bg-slate-50 p-20 text-center shadow-sm">
            <h3 className="text-2xl font-black text-[#1A2E44]">Belum Ada Paket Tersedia</h3>
            <p className="mt-4 text-slate-400 font-medium max-w-md mx-auto">Tim kami sedang menyiapkan materi terbaik untuk kesuksesan belajar kamu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {packages.map((pkg) => {
              const isFree = pkg.price === 0;
              const discountPercent = 75;
              const originalPrice = isFree ? 0 : pkg.price * (100 / (100 - discountPercent));
              const totalLessons = pkg.packageCourses.reduce((acc, pc) => acc + (pc.lessonLimit ?? pkg.defaultLessonLimit), 0) || 7;
              
              // Try to get a thumbnail from the first course, fallback to a nice Unsplash image
              const fallbackImage = "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800";
              const image = pkg.packageCourses[0]?.course.thumbnailUrl || fallbackImage;

              return (
                <div key={pkg.id} className="group flex flex-col bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                  
                  {/* Product Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img src={image} alt={pkg.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                      <div className="text-blue-500"><FileText size={14} strokeWidth={3} /></div>
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">{totalLessons} Materi</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6 flex flex-col">
                    <h3 className="text-sm font-black text-[#1A2E44] line-clamp-2 leading-snug mb-3 uppercase tracking-tight">{pkg.name}</h3>
                    <p className="text-[11px] font-medium text-slate-400 line-clamp-2 mb-6 flex-1">
                      {pkg.description || `Dapatkan akses eksklusif ke program ${pkg.name}.`}
                    </p>
                    
                    {/* Pricing */}
                    <div className="flex flex-col gap-1 mb-6">
                      {isFree ? (
                        <>
                          <div className="flex items-center gap-2 h-4" />
                          <p className="text-xl font-black text-emerald-600">Gratis ✨</p>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                             <span className="bg-green-100 text-green-600 text-[9px] font-black px-2 py-0.5 rounded-md">
                                {discountPercent}%
                             </span>
                             <span className="text-[11px] font-bold text-slate-300 line-through">{formatPrice(originalPrice)}</span>
                          </div>
                          <p className="text-xl font-black text-[#8B0000]">{formatPrice(pkg.price)}</p>
                        </>
                      )}
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
              );
            })}
          </div>
        )}
      </section>

    </main>
  );
}
