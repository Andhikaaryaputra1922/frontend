"use client";

import React from "react";

interface IslamicPanelProps {
  children: React.ReactNode;
  variant?: "emerald" | "navy" | "gold" | "white" | "cream";
  title?: string;
  className?: string;
}

export function IslamicPanel({ children, variant = "white", title, className = "" }: IslamicPanelProps) {
  const getStyles = () => {
    switch (variant) {
      case "emerald":
        return "bg-[#064E3B] text-white border-emerald-800";
      case "navy":
        return "bg-[#0F172A] text-white border-slate-800";
      case "gold":
        return "bg-gradient-to-br from-[#B8860B] via-[#D4AF37] to-[#8B4513] text-white border-amber-400";
      case "cream":
        return "bg-[#FAF9F6] text-slate-800 border-[#E8D5D5]";
      default:
        return "bg-white text-slate-800 border-slate-100 shadow-2xl shadow-slate-200/50";
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-[40px] border p-10 ${getStyles()} ${className}`}>
      {/* Sophisticated Islamic Geometric Pattern */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ 
             backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%23000' stroke-width='1'%3E%3Cpath d='M40 0l10 30h30L55 45l10 35L40 60 15 80l10-35L0 30h30L40 0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
             backgroundSize: "60px 60px"
           }} 
      />
      
      {/* Top Decorative Arc */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 w-32 h-2 bg-gradient-to-r from-transparent via-[#8B0000]/20 to-transparent rounded-full" />
      
      {title && (
        <div className="relative z-10 mb-8 text-center">
          <h3 className="font-serif text-3xl font-black tracking-tight uppercase">{title}</h3>
          <div className="mt-4 flex items-center justify-center gap-3">
            <div className="h-[1px] w-8 bg-slate-200" />
            <div className="h-1.5 w-1.5 rotate-45 bg-[#E5B54F]" />
            <div className="h-[1px] w-8 bg-slate-200" />
          </div>
        </div>
      )}
      
      <div className="relative z-10">
        {children}
      </div>

      {/* Mihrab-style Bottom Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8B0000]/10 to-transparent" />
    </div>
  );
}

export function IslamicCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`group relative overflow-hidden rounded-[35px] bg-white p-8 border border-slate-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200 ${className}`}>
      {/* Mihrab Shape Overlay (Subtle) */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.02] transition-opacity duration-500 pointer-events-none bg-[#1A2E44]" />
      
      {/* Decorative Star Corner */}
      <div className="absolute -right-2 -top-2 h-12 w-12 rotate-12 opacity-5 text-[#E5B54F] group-hover:opacity-10 group-hover:rotate-45 transition-all duration-700">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z"/></svg>
      </div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
