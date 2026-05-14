"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { PremiumModal } from "@/shared/components/ui/PremiumFeedback";

/* ── SVG Icons ─────────────────────────────── */
const IC = {
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Attendance: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>
    </svg>
  ),
  Book: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  Clipboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    </svg>
  ),
  Quiz: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Report: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  ),
  Play: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  Settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  Logout: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Help: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  ChevronL: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
  ),
  ChevronR: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
  ),
};

export default function TeacherSidebar({ name, role, image }: { name?: string; role: string; image?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navItems = [
    { label: "Dashboard", icon: <IC.Dashboard />, href: "/teacher" },
    { label: "Kursus Saya", icon: <IC.Book />, href: "/teacher/courses" },
    { label: "Absensi", icon: <IC.Attendance />, href: "/teacher/attendance" },
    { label: "Arsip Materi", icon: <IC.Play />, href: "/teacher/materials" },
    { label: "Tugas", icon: <IC.Clipboard />, href: "/teacher/assignments" },
    { label: "Kuis", icon: <IC.Quiz />, href: "/teacher/quizzes" },
    { label: "Laporan", icon: <IC.Report />, href: "/teacher/reports" },
  ];

  const bottomItems = [
    { label: "Pengaturan", icon: <IC.Settings />, href: "/teacher/settings" },
    { label: "Pusat Bantuan", icon: <IC.Help />, href: "/teacher/help" },
  ];

  const activeIndex = navItems.findIndex(item => pathname === item.href || (item.href !== "/teacher" && pathname.startsWith(item.href)));

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      if (res.ok) { router.push("/login"); router.refresh(); }
    } catch { alert("Gagal logout"); }
    finally { setLogoutLoading(false); setShowLogoutModal(false); }
  };

  const initials = name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "T";

  return (
    <>
      <PremiumModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleLogout} title="Logout" message="Keluar dari Panel Pengajar?" type="logout" confirmText="Logout" loading={logoutLoading} />
      
      <aside
        style={{ 
          width: collapsed ? "80px" : "240px",
          transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)"
        }}
        className="fixed left-0 top-0 z-30 flex h-screen flex-col bg-[#1A2E44]"
      >
        <div className="flex h-20 shrink-0 items-center px-6">
          {!collapsed ? (
            <div className="flex flex-col">
              <span className="text-base font-black text-white tracking-tighter leading-none">HANEEN<span className="text-[#E5B54F]">.</span></span>
              <span className="text-[6px] font-black text-[#E5B54F] uppercase tracking-[0.3em] mt-1">TEACHER</span>
            </div>
          ) : (
            <div className="h-9 w-9 mx-auto rounded-xl bg-[#E5B54F] flex items-center justify-center font-black text-[#1A2E44]">T</div>
          )}
        </div>

        {/* Profile Section (REFINED STACKED STYLE) */}
        <div className={`px-4 mb-8 ${collapsed ? "flex justify-center" : ""}`}>
           <div className={`flex flex-col items-center`}>
              <div className={`shrink-0 rounded-full bg-[#E5B54F] border-4 border-white/5 flex items-center justify-center font-black text-[#1A2E44] shadow-2xl transition-all overflow-hidden relative ${collapsed ? "h-10 w-10 text-[10px]" : "h-16 w-16 text-xl"}`}>
                 {image ? <img src={image} className="h-full w-full object-cover" /> : initials}
              </div>
              {!collapsed && (
                 <div className="mt-4 text-center px-2">
                    <p className="text-[10px] font-black text-white uppercase tracking-wider leading-tight line-clamp-2">{name || "Pengajar"}</p>
                    <p className="text-[8px] font-bold text-[#E5B54F] uppercase tracking-[0.2em] mt-1.5 opacity-60">{role}</p>
                 </div>
              )}
           </div>
        </div>

        <nav className="flex-1 overflow-y-auto pb-4 relative custom-scrollbar">
          <div className="flex flex-col relative">
            {!collapsed && activeIndex !== -1 && (
              <div 
                style={{ 
                  transform: `translateY(${activeIndex * 44}px)`,
                  transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
                }}
                className="absolute left-3 right-0 h-11 bg-[#F8FAFC] rounded-l-[30px] z-0"
              >
                 {/* Top Curve */}
                 <div className="absolute -top-[20px] right-0 w-5 h-5 overflow-hidden">
                    <div className="w-full h-full bg-[#F8FAFC]" />
                    <div className="absolute inset-0 bg-[#1A2E44] rounded-br-[20px]" />
                 </div>
                 {/* Bottom Curve */}
                 <div className="absolute -bottom-[20px] right-0 w-5 h-5 overflow-hidden">
                    <div className="w-full h-full bg-[#F8FAFC]" />
                    <div className="absolute inset-0 bg-[#1A2E44] rounded-tr-[20px]" />
                 </div>
              </div>
            )}

            {navItems.map((item, idx) => {
              const isActive = activeIndex === idx;
              return (
                <div key={item.href} className="relative px-3 z-10">
                  <Link href={item.href}
                    className={`group flex items-center h-11 transition-all duration-500 ${collapsed ? "justify-center rounded-2xl mb-2" : "px-5 rounded-l-[30px] -mr-3"} ${
                      isActive 
                        ? collapsed ? "bg-[#E5B54F] text-[#1A2E44]" : "text-[#1A2E44] font-black" 
                        : "text-white/30 hover:text-white"
                    }`}>
                    <span className={`shrink-0 transition-all duration-500 ${isActive ? "scale-110" : "group-hover:scale-110 group-hover:rotate-6"}`}>{item.icon}</span>
                    {!collapsed && <span className="ml-3 text-[9px] font-black uppercase tracking-[0.15em] truncate">{item.label}</span>}
                  </Link>
                </div>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="shrink-0 p-4 border-t border-white/5 space-y-1">
          {bottomItems.map((item) => (
            <Link key={item.href} href={item.href} className={`flex items-center h-10 transition-colors ${collapsed ? "justify-center" : "px-4 gap-3 text-white/40 hover:text-white"}`}>
               <span className="shrink-0 scale-90">{item.icon}</span>
               {!collapsed && <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>}
            </Link>
          ))}
          <button onClick={() => setShowLogoutModal(true)} className={`flex w-full items-center h-10 transition-all ${collapsed ? "justify-center" : "px-4 gap-3 text-white/40 hover:text-rose-400"}`}>
             <IC.Logout />
             {!collapsed && <span className="text-[9px] font-bold uppercase tracking-widest">Log out</span>}
          </button>
        </div>

        <button onClick={() => setCollapsed(!collapsed)} className="absolute -right-4 top-20 flex h-8 w-8 items-center justify-center rounded-full bg-[#E5B54F] text-[#1A2E44] z-50 border-4 border-[#F8FAFC] hover:scale-110 transition-all">
          {collapsed ? <IC.ChevronR size={12} /> : <IC.ChevronL size={12} />}
        </button>
      </aside>

      <div style={{ width: collapsed ? "80px" : "240px", transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)" }} className="hidden lg:block shrink-0" />
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
      `}</style>
    </>
  );
}
