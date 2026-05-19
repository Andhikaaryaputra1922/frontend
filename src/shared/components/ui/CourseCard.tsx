"use client";

import { Star, Users, ArrowUpRight } from "lucide-react";
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
  price,
}: CourseCardProps) {
  return (
    <Link
      href={`/courses/${id}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl bg-[#0B1929] border border-white/5 transition-all duration-500 hover:-translate-y-1 hover:border-[#D4AF37]/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={thumbnail}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 brightness-90"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1929] via-[#0B1929]/20 to-transparent" />

        {/* Category Badge */}
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 backdrop-blur-md px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">
            {category}
          </span>
        </div>

        {/* Rating pill — top right */}
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 px-2.5 py-1">
          <Star size={11} fill="#D4AF37" className="text-[#D4AF37]" />
          <span className="text-[11px] font-black text-white">{rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6 gap-4">
        {/* Teacher */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[10px] font-black text-[#D4AF37]">
            {teacher.name.charAt(0)}
          </div>
          <span className="text-[11px] font-semibold text-white/40 truncate">
            {teacher.name}
          </span>
          <div className="ml-auto flex items-center gap-1 text-white/30">
            <Users size={11} />
            <span className="text-[10px] font-bold">{students.toLocaleString()}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-black leading-snug tracking-tight text-white group-hover:text-[#D4AF37] transition-colors duration-300 line-clamp-2">
          {title}
        </h3>

        {/* Divider */}
        <div className="h-px bg-white/5" />

        {/* Footer: price + cta */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-0.5">Investasi</p>
            <p className="text-lg font-black text-white">
              {price === 0 ? (
                <span className="text-[#D4AF37]">GRATIS</span>
              ) : (
                `Rp ${price.toLocaleString("id-ID")}`
              )}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/50 transition-all duration-300 group-hover:bg-[#D4AF37] group-hover:border-[#D4AF37] group-hover:text-[#0B1929] group-hover:rotate-12">
            <ArrowUpRight size={18} />
          </div>
        </div>
      </div>

      {/* Gold glow on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ boxShadow: "inset 0 0 40px rgba(212,175,55,0.05)" }} />
    </Link>
  );
}
