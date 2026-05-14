"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, User, Settings, ShoppingCart, BookOpen, LayoutGrid, Sun, Moon } from "lucide-react";
import { PremiumModal } from "@/shared/components/ui/PremiumFeedback";

interface Props {
  name?: string;
}

export default function StudentHeader({ name }: Props) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-100 shadow-sm">
      <div className="mx-auto flex h-20 w-full items-center justify-between px-6 md:px-10">
        
        {/* Breadcrumb or Welcome */}
        <div className="flex items-center gap-3">
           <div className="h-2 w-2 rounded-full bg-[#8B0000] animate-pulse" />
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Student <span className="text-slate-200 mx-2">/</span> <span className="text-[#8B0000]">Dashboard</span></p>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          
          {/* Theme / Settings */}
          <div className="flex items-center bg-slate-50 rounded-full p-1 border border-slate-100">
             <button className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                <Sun size={18} className="text-slate-400" />
             </button>
             <Link href="/student/settings" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                <Settings size={18} className="text-slate-400" />
             </Link>
          </div>

        </div>

      </div>
    </header>
  );
}
