"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  name?: string;
  role?: string;
  image?: string;
}
export default function TeacherHeader({ name, role, image }: Props) {
  const pathname = usePathname();
  const initials = name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "T";

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-[#0A1628] border-b border-slate-100 dark:border-white/5 shadow-sm transition-colors duration-300">
      <div className="mx-auto flex h-20 w-full items-center justify-between px-6 md:px-10">
        
        {/* Breadcrumb or Welcome */}
        <div className="flex items-center gap-3">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Teacher <span className="text-slate-200 dark:text-white/10 mx-2">/</span> <span className="text-[#1A2E44] dark:text-[#E5B54F]">Dashboard</span></p>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          {/* User Profile */}
          <div className="flex items-center gap-3 pl-6 border-l border-slate-100 dark:border-white/5">
             <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-[#1A2E44] dark:text-white uppercase tracking-wider">{name || "Pengajar"}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{role || "Teacher"}</p>
             </div>
             <div className="h-10 w-10 rounded-full bg-[#E5B54F] border-2 border-white shadow-lg flex items-center justify-center text-[#1A2E44] font-black text-sm overflow-hidden">
                {image ? <img src={image} className="h-full w-full object-cover" /> : initials}
             </div>
          </div>

        </div>

      </div>
    </header>
  );
}
