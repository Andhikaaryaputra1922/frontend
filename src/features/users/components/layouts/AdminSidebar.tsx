"use client";

import BaseSidebar from "./BaseSidebar";
import {
  LayoutDashboard, CalendarDays, Package, Users,
  CreditCard, Clock, ClipboardList, Award, BookOpen, LifeBuoy,
} from "lucide-react";

export default function AdminSidebar({ name, email }: { name?: string; email?: string }) {
  const navItems = [
    { label: "Dashboard",       icon: <LayoutDashboard size={16} />, href: "/admin" },
    { label: "Angkatan",        icon: <CalendarDays size={16} />,    href: "/admin/batches" },
    { label: "Paket",           icon: <Package size={16} />,         href: "/admin/packages" },
    { label: "User",            icon: <Users size={16} />,           href: "/admin/users" },
    { label: "Transaksi",       icon: <CreditCard size={16} />,      href: "/admin/transactions" },
    { label: "Jadwal",          icon: <Clock size={16} />,           href: "/admin/schedules" },
    { label: "Presensi",        icon: <ClipboardList size={16} />,   href: "/admin/attendance" },
    { label: "Sertifikat",      icon: <Award size={16} />,           href: "/admin/certificates" },
    { label: "Mata Pelajaran",  icon: <BookOpen size={16} />,        href: "/admin/courses" },
    { label: "Pusat Bantuan",   icon: <LifeBuoy size={16} />,        href: "/admin/help" },
  ];

  return (
    <BaseSidebar
      name={name}
      email={email}
      roleLabel="Admin"
      homeHref="/admin"
      navItems={navItems}
      settingsHref="/admin/settings"
      logoutMessage="Keluar dari Panel Admin?"
    />
  );
}
