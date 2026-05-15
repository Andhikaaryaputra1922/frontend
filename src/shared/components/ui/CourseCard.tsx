"use client";

import { Star, Users, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface CourseCardProps {
  id: string;
  title: string;
  thumbnail: string;
  category: string;
  teacher: {
    name: string;
    image?: string;
  };
  rating: number;
  students: number;
  duration?: string;
  price: number;
}

export function CourseCard({
  id,
  title,
  thumbnail,
  category,
  teacher,
  rating,
  students,
  duration,
  price
}: CourseCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-[40px] bg-white border border-slate-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200/50">
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={thumbnail}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Category Badge */}
        <div className="absolute left-6 top-6">
          <span className="rounded-full bg-white/90 backdrop-blur-md px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#1A2E44] shadow-sm">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex text-amber-400">
              <Star size={14} fill="currentColor" />
            </div>
            <span className="text-xs font-bold text-slate-400">{rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Users size={14} />
            <span className="text-xs font-bold">{students} Siswa</span>
          </div>
        </div>

        <h3 className="mb-4 text-xl font-black leading-tight text-[#1A2E44] group-hover:text-[#8B0000] transition-colors">
          {title}
        </h3>

        <div className="mb-8 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
            {teacher.image ? (
              <img src={teacher.image} alt={teacher.name} className="h-full w-full object-cover" />
            ) : (
              <div className="text-[10px] font-bold text-slate-400">{teacher.name.charAt(0)}</div>
            )}
          </div>
          <span className="text-xs font-bold text-slate-500">Oleh <span className="text-slate-800">{teacher.name}</span></span>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Investasi</p>
            <p className="text-lg font-black text-[#1A2E44]">
              {price === 0 ? "GRATIS" : `Rp ${price.toLocaleString()}`}
            </p>
          </div>
          <Link
            href={`/courses/${id}`}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FAF9F6] text-[#1A2E44] transition-all hover:bg-[#1A2E44] hover:text-white hover:rotate-12 active:scale-90"
          >
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}
