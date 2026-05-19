"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, User, ShoppingCart, BookOpen, LayoutGrid } from "lucide-react";
import { PremiumModal } from "@/shared/components/ui/PremiumFeedback";

interface Props {
  name?: string;
}
export default function StudentHeader({ name }: Props) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-[#0A1628] border-b border-slate-100 dark:border-white/5 shadow-sm transition-colors duration-300">
      <div className="mx-auto flex h-20 w-full items-center justify-between px-6 md:px-10">

        {/* Breadcrumb or Welcome */}
        <div className="flex items-center gap-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Student <span className="text-slate-200 dark:text-white/10 mx-2">/</span> <span className="text-[#0B213F] dark:text-[#D4AF37]">Dashboard</span></p>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          {/* User Profile */}
          <div className="flex items-center gap-3 pl-6 border-l border-slate-100 dark:border-white/5">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-[#0B213F] dark:text-white uppercase tracking-wider">{name || "Siswa"}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Premium Student</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-[#D4AF37] border-2 border-white shadow-lg flex items-center justify-center text-[#0B213F] font-black text-sm">
              {name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "S"}
            </div>
          </div>

        </div>

      </div>
    </header>
  );
}
