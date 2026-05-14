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
  Play: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"/>
    </svg>
  ),
  Award: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
    </svg>
  ),
  Package: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  Cart: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
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

interface Props {
  name?: string;
  email?: string;
  hasActivePackage?: boolean;
}

export default function StudentSidebar({ name, email, hasActivePackage }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const hasPkg = hasActivePackage === true;

  const navItems = [
    { label: "Beranda", icon: <IC.Dashboard />, href: "/student", always: true },
    { label: "Paket Belajar", icon: <IC.Package />, href: "/student/packages", always: true },
    { label: "Keranjang", icon: <IC.Cart />, href: "/student/cart", always: true },
    { label: "Kursus Saya", icon: <IC.Book />, href: "/student/enrollments", always: false },
    { label: "Tugas", icon: <IC.Clipboard />, href: "/student/assignments", always: false },
    { label: "Kuis", icon: <IC.Quiz />, href: "/student/quizzes", always: false },
    { label: "Materi", icon: <IC.Play />, href: "/student/materials", always: false },
    { label: "Sertifikat", icon: <IC.Award />, href: "/student/certificates", always: false },
  ];

  const bottomItems = [
    { label: "Pengaturan", icon: <IC.Settings />, href: "/student/settings" },
    { label: "Pusat Bantuan", icon: <IC.Help />, href: "/student/help" },
  ];

  const visibleItems = navItems.filter(item => item.always || hasPkg);
  const activeIndex = visibleItems.findIndex(item => pathname === item.href || (item.href !== "/student" && pathname.startsWith(item.href)));

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      if (res.ok) { router.push("/login"); router.refresh(); }
    } catch { alert("Gagal logout"); }
    finally { setLogoutLoading(false); setShowLogoutModal(false); }
  };

  const initials = name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "S";

  return (
    <>
      <PremiumModal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} onConfirm={handleLogout} title="Logout" message="Yakin ingin keluar?" type="logout" confirmText="Logout" loading={logoutLoading} />
      
      <aside
        style={{ 
          width: collapsed ? "80px" : "240px",
          transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)"
        }}
        className="fixed left-0 top-0 z-30 flex h-screen flex-col bg-[#8B0000]"
      >
        {/* Logo Section */}
        <div className="flex h-20 shrink-0 items-center px-6">
          {!collapsed ? (
            <div className="flex flex-col">
              <span className="text-base font-black text-white tracking-tighter leading-none">HANEEN<span className="text-[#E5B54F]">.</span></span>
              <span className="text-[6px] font-black text-[#E5B54F] uppercase tracking-[0.3em] mt-1">Academy</span>
            </div>
          ) : (
            <div className="h-9 w-9 mx-auto rounded-xl bg-[#E5B54F] flex items-center justify-center font-black text-[#8B0000]">H</div>
          )}
        </div>

        {/* Profile Section (REFINED STACKED STYLE) */}
        <div className={`px-4 mb-10 ${collapsed ? "flex justify-center" : ""}`}>
           <div className={`flex flex-col items-center`}>
              <div className={`shrink-0 rounded-full bg-[#E5B54F] border-[6px] border-white/5 flex items-center justify-center font-black text-[#8B0000] shadow-2xl transition-all overflow-hidden ${collapsed ? "h-12 w-12 text-xs" : "h-24 w-24 text-4xl"}`}>
                 {initials}
              </div>
              {!collapsed && (
                 <div className="mt-5 text-center px-2">
                    <p className="text-sm font-black text-white uppercase tracking-widest leading-snug line-clamp-2">{name || "Siswa"}</p>
                 </div>
              )}
           </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 overflow-y-auto pb-4 relative custom-scrollbar">
          <div className="flex flex-col relative">
            {!collapsed && activeIndex !== -1 && (
              <div 
                style={{ 
                  transform: `translateY(${activeIndex * 44}px)`,
                  transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
                }}
                className="absolute left-3 right-0 h-11 bg-[#FDFDFD] rounded-l-[30px] z-0"
              >
                 {/* Top Curve */}
                 <div className="absolute -top-[20px] right-0 w-5 h-5 overflow-hidden">
                    <div className="w-full h-full bg-[#FDFDFD]" />
                    <div className="absolute inset-0 bg-[#8B0000] rounded-br-[20px]" />
                 </div>
                 {/* Bottom Curve */}
                 <div className="absolute -bottom-[20px] right-0 w-5 h-5 overflow-hidden">
                    <div className="w-full h-full bg-[#FDFDFD]" />
                    <div className="absolute inset-0 bg-[#8B0000] rounded-tr-[20px]" />
                 </div>
              </div>
            )}

            {visibleItems.map((item, idx) => {
              const isActive = activeIndex === idx;
              return (
                <div key={item.href} className="relative px-3 z-10">
                  <Link href={item.href}
                    className={`group flex items-center h-11 transition-all duration-500 ${collapsed ? "justify-center rounded-2xl mb-2" : "px-5 rounded-l-[30px] -mr-3"} ${
                      isActive 
                        ? collapsed ? "bg-[#E5B54F] text-[#8B0000]" : "text-[#8B0000] font-black" 
                        : "text-white/70 hover:text-white"
                    }`}>
                    <span className={`shrink-0 transition-all duration-500 ${isActive ? "scale-110" : "group-hover:scale-110 group-hover:rotate-6"} ${isActive ? "" : "text-white/50 group-hover:text-white"}`}>{item.icon}</span>
                    {!collapsed && <span className="ml-3 text-[9px] font-bold uppercase tracking-[0.15em] truncate">{item.label}</span>}
                  </Link>
                </div>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="shrink-0 p-4 border-t border-white/10 space-y-4 bg-black/5">
          
          {/* Upgrade Card (Only if no active package) */}
          {!hasPkg && !collapsed && (
            <div className="rounded-2xl bg-black/20 p-4 border border-white/10 relative overflow-hidden group">
               <div className="absolute -right-4 -top-4 h-16 w-16 bg-[#E5B54F]/10 rounded-full blur-2xl group-hover:bg-[#E5B54F]/20 transition-all" />
               <h4 className="text-[10px] font-black text-white uppercase tracking-widest relative z-10">Upgrade To Pro</h4>
               <p className="text-[8px] text-white/40 mt-1 leading-relaxed relative z-10">Dapatkan akses ke materi & kuis premium.</p>
               <Link href="/student/packages" className="mt-3 block w-full py-2 rounded-xl bg-white/10 hover:bg-[#E5B54F] text-[9px] font-black text-white hover:text-[#8B0000] text-center uppercase tracking-widest transition-all">
                  Upgrade
               </Link>
            </div>
          )}

          {/* Bottom Nav Items */}
          <div className="space-y-1">
             {bottomItems.map((item) => (
                <Link key={item.href} href={item.href} className={`flex items-center h-10 rounded-xl transition-all ${collapsed ? "justify-center" : "px-4 gap-3 text-white/70 hover:bg-white/10 hover:text-white group"}`}>
                   <span className="shrink-0 scale-90 text-white/40 group-hover:text-white transition-colors">{item.icon}</span>
                   {!collapsed && <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>}
                </Link>
             ))}
             <button onClick={() => setShowLogoutModal(true)} className={`flex w-full items-center h-10 rounded-xl transition-all ${collapsed ? "justify-center" : "px-4 gap-3 text-white/70 hover:bg-rose-500/20 hover:text-rose-200 group"}`}>
                <span className="shrink-0 scale-90 text-white/40 group-hover:text-rose-200 transition-colors"><IC.Logout /></span>
                {!collapsed && <span className="text-[9px] font-black uppercase tracking-widest">Log out</span>}
             </button>
          </div>
        </div>

        <button onClick={() => setCollapsed(!collapsed)} className="absolute -right-4 top-20 flex h-8 w-8 items-center justify-center rounded-full bg-[#E5B54F] text-[#1A2E44] z-50 border-4 border-[#FAF9F6] hover:scale-110 transition-all">
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
