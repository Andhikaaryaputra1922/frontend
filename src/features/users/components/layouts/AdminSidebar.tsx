"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { PremiumModal } from "@/shared/components/ui/PremiumFeedback";
import { FeatureTourModal } from "@/features/admin/components/FeatureTourModal";
import { AnimatePresence } from "framer-motion";

/* ── SVG Icons ─────────────────────────────── */
const IC = {
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  Users: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Packages: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  Transactions: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  Courses: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  Logout: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  Help: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Chat: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  ),
  Assignment: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M7 10h10"/><path d="M7 14h10"/><path d="M7 18h5"/>
    </svg>
  ),
  Shield: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
    </svg>
  ),
  ChevronL: ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6"/>
    </svg>
  ),
  ChevronR: ({ size = 18 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  ),
};

export default function AdminSidebar({ name, email }: { name?: string; email?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const navItems = [
    { label: "Dashboard", icon: <IC.Dashboard />, href: "/admin" },
    { label: "User", icon: <IC.Users />, href: "/admin/users" },
    { label: "Paket", icon: <IC.Packages />, href: "/admin/packages" },
    { label: "Transaksi", icon: <IC.Transactions />, href: "/admin/transactions" },
    { label: "Jadwal", icon: <IC.Calendar />, href: "/admin/schedules" },
    { label: "Moderasi", icon: <IC.Courses />, href: "/admin/courses" },
  ];

  const bottomItems = [
    { label: "Pengaturan", icon: <IC.Settings />, href: "/admin/settings" },
    { label: "Pusat Bantuan", icon: <IC.Help />, href: "/admin/help" },
  ];

  const activeIndex = navItems.findIndex(item => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href)));

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      if (res.ok) { router.push("/login"); router.refresh(); }
    } catch { alert("Gagal logout"); }
    finally { setLogoutLoading(false); setShowLogoutModal(false); }
  };

  const initials = name ? name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "AD";

  return (
    <>
      <PremiumModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
        onConfirm={handleLogout} 
        title="Logout" 
        message="Keluar dari Panel Admin?" 
        type="logout" 
        confirmText="Logout" 
        loading={logoutLoading} 
      />
      
      <aside
        style={{ 
          width: collapsed ? "80px" : "240px",
          transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)"
        }}
        className="fixed left-0 top-0 z-30 flex h-screen flex-col bg-[#1A2E44]"
      >
        <div className={`flex h-24 shrink-0 items-center justify-center transition-all duration-500 overflow-hidden ${collapsed ? "px-2" : "px-0"}`}>
          <Link href="/admin" className="relative h-20 w-full flex items-center justify-center">
            <img 
              src="/images/logo.svg" 
              alt="Haneen Academy" 
              className={`w-full h-full object-contain transition-all duration-700 ${collapsed ? "scale-150" : "scale-[3.5]"}`}
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto pb-4 relative custom-scrollbar">
          <div className="flex flex-col relative">
            {!collapsed && activeIndex !== -1 && (
              <div 
                style={{ 
                  transform: `translateY(${activeIndex * 44}px)`,
                  transition: "transform 0.3s ease-in-out"
                }}
                className="absolute left-3 right-0 h-11 bg-[#FDFDFD] rounded-l-[30px] z-0"
              >
                 <div className="absolute -top-[20px] right-0 w-5 h-5 overflow-hidden">
                    <div className="w-full h-full bg-[#FDFDFD]" />
                    <div className="absolute inset-0 bg-[#1A2E44] rounded-br-[20px]" />
                 </div>
                 <div className="absolute -bottom-[20px] right-0 w-5 h-5 overflow-hidden">
                    <div className="w-full h-full bg-[#FDFDFD]" />
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
                    <span className={`shrink-0 transition-all duration-300`}>{item.icon}</span>
                    {!collapsed && <span className="ml-3 text-[9px] font-black uppercase tracking-[0.15em] truncate">{item.label}</span>}
                  </Link>
                </div>
              );
            })}
          </div>
        </nav>

        <div className="px-4 mb-4">
          {!collapsed ? (
            <div className="rounded-[24px] bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.25)] relative overflow-hidden group">
               <div className="absolute -right-4 -top-4 h-16 w-16 bg-[#E5B54F]/10 rounded-full blur-2xl group-hover:bg-[#E5B54F]/20 transition-all" />
               <h4 className="text-[11px] font-black text-[#1A2E44] leading-tight">
                 Butuh bantuan <br /> 
                 <span className="text-[#E5B54F]">dengan fitur kami?</span>
               </h4>
               <p className="text-[8px] text-slate-400 mt-2 font-bold uppercase tracking-wider">Hubungi Admin sekarang!</p>
               <button className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-100 hover:border-[#E5B54F] hover:bg-white text-[#1A2E44] transition-all shadow-sm group/btn active:scale-95">
                  <div className="h-5 w-5 rounded-lg bg-[#1A2E44] flex items-center justify-center text-white">
                     <IC.Chat />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.1em]">Support</span>
               </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
               <button className="h-10 w-10 rounded-xl bg-white shadow-lg flex items-center justify-center text-[#1A2E44] hover:bg-[#E5B54F] transition-all active:scale-90">
                  <IC.Chat />
               </button>
            </div>
          )}
        </div>

        <div className="shrink-0 p-4 border-t border-white/5 space-y-1">
          {bottomItems.map((item) => {
            const isHelp = item.label === "Pusat Bantuan";
            return (
              <button 
                key={item.href} 
                onClick={() => {
                  if (isHelp) setShowHelpModal(true);
                  else router.push(item.href);
                }} 
                className={`flex w-full items-center h-10 transition-colors ${collapsed ? "justify-center" : "px-4 gap-3 text-white/40 hover:text-white"}`}
              >
                 <span className="shrink-0 scale-90">{item.icon}</span>
                 {!collapsed && <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>}
              </button>
            );
          })}
          <button onClick={() => setShowLogoutModal(true)} className={`flex w-full items-center h-10 transition-all ${collapsed ? "justify-center" : "px-4 gap-3 text-white/40 hover:text-rose-400"}`}>
             <IC.Logout />
             {!collapsed && <span className="text-[9px] font-bold uppercase tracking-widest">Log out</span>}
          </button>
        </div>

        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="absolute -right-4 top-20 flex h-8 w-8 items-center justify-center rounded-full bg-[#E5B54F] text-[#1A2E44] z-50 border-4 border-[#F8FAFC] hover:scale-110 transition-all"
        >
          {collapsed ? <IC.ChevronR size={12} /> : <IC.ChevronL size={12} />}
        </button>
      </aside>

      <AnimatePresence>
        {showHelpModal && (
          <FeatureTourModal onClose={() => setShowHelpModal(false)} />
        )}
      </AnimatePresence>

      <div style={{ width: collapsed ? "80px" : "240px", transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)" }} className="hidden lg:block shrink-0" />
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
      `}</style>
    </>
  );
}
