"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, BookOpen, Clock, Users, Search, ShoppingBag } from "lucide-react";

interface StorePackage {
  id: string;
  name: string;
  description: string | null;
  price: number;
  defaultLessonLimit: number;
  classSchedule?: string | null;
  batch: {
    id: string;
    name: string;
    maxStudents: number;
    _count: { enrollments: number };
  } | null;
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
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");

  useEffect(() => {
    fetch("/api/packages/store", { credentials: "include" })
      .then(r => r.json())
      .then(d => setPackages((d.packages || []).map((p: any) => ({ ...p, price: Number(p.price) }))))
      .catch(() => setPackages([]))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  const visible = packages.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="mx-auto max-w-6xl px-6 md:px-10 py-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Katalog</p>
            <h1 className="text-2xl font-bold tracking-tight text-[#0B213F]">Paket Belajar</h1>
            <p className="mt-1 text-sm text-slate-400">Pilih paket yang sesuai dan mulai perjalanan belajarmu.</p>
          </div>
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari paket..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]/50 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="h-44 bg-slate-100 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2" />
                  <div className="h-9 bg-slate-100 rounded-xl animate-pulse mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-slate-200">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Package size={28} className="text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-500">
              {search ? "Paket tidak ditemukan" : "Belum ada paket tersedia"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {search ? "Coba kata kunci lain" : "Tim kami sedang menyiapkan materi terbaik."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visible.map(pkg => {
              const isFree  = pkg.price === 0;
              const isFull  = (pkg.batch?.maxStudents ?? 0) > 0 &&
                              (pkg.batch?._count?.enrollments ?? 0) >= (pkg.batch?.maxStudents ?? 0);
              const thumb   = pkg.packageCourses[0]?.course.thumbnailUrl;
              const courses = pkg.packageCourses.length;
              const duration = pkg.defaultLessonLimit > 0 ? `${pkg.defaultLessonLimit} hari` : "Selamanya";

              return (
                <div key={pkg.id}
                  className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col">

                  {/* Thumbnail */}
                  <div className="relative h-44 bg-[#0B213F] overflow-hidden shrink-0">
                    {thumb ? (
                      <img src={thumb} alt={pkg.name}
                        className="h-full w-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <Package size={32} className="text-[#D4AF37]/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B213F]/50 to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {pkg.batch && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur text-[#0B213F] px-2.5 py-1 rounded-lg">
                          {pkg.batch.name}
                        </span>
                      )}
                      {isFull && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-rose-500 text-white px-2.5 py-1 rounded-lg">
                          Penuh
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex flex-col flex-1 p-5">
                    <h3 className="text-[13px] font-bold text-[#0B213F] leading-snug line-clamp-2 mb-2">{pkg.name}</h3>

                    {pkg.description && (
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 mb-3">{pkg.description}</p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-3 mb-4 mt-auto">
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                        <BookOpen size={11} /> {courses} mapel
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                        <Clock size={11} /> {duration}
                      </span>
                      {pkg.batch && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                          <Users size={11} /> {pkg.batch._count.enrollments}/{pkg.batch.maxStudents || "∞"}
                        </span>
                      )}
                    </div>

                    {/* Price + CTA */}
                    <div className="flex items-center justify-between gap-3">
                      <p className={`text-lg font-black tracking-tight ${isFree ? "text-emerald-600" : "text-[#D4AF37]"}`}>
                        {isFree ? "Gratis" : fmt(pkg.price)}
                      </p>

                      {isFull ? (
                        <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-4 py-2 rounded-xl">
                          Penuh
                        </span>
                      ) : (
                        <Link href={`/student/packages/${pkg.id}`}
                          className="flex items-center gap-1.5 bg-[#0B213F] text-white text-[11px] font-bold px-4 py-2 rounded-xl hover:bg-[#D4AF37] hover:text-[#0B213F] transition-all">
                          <ShoppingBag size={12} /> Detail
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
