"use client";

import BaseSidebar, { NavItem } from "./BaseSidebar";
import {
  LayoutDashboard, Package, ShoppingCart, BookOpen,
  ClipboardList, HelpCircle, CalendarDays, Users, Award,
} from "lucide-react";

interface Props {
  name?: string;
  email?: string;
  hasActivePackage?: boolean;
}

export default function StudentSidebar({ name, email, hasActivePackage }: Props) {
  const hasPkg = hasActivePackage === true;

  const allItems: (NavItem & { always: boolean })[] = [
    { label: "Beranda",       icon: <LayoutDashboard size={16} />, href: "/student",              always: true },
    { label: "Paket Belajar", icon: <Package size={16} />,         href: "/student/packages",     always: true },
    { label: "Keranjang",     icon: <ShoppingCart size={16} />,    href: "/student/cart",         always: true },
    { label: "Kursus Saya",   icon: <BookOpen size={16} />,        href: "/student/enrollments",  always: false },
    { label: "Tugas",         icon: <ClipboardList size={16} />,   href: "/student/assignments",  always: false },
    { label: "Kuis",          icon: <HelpCircle size={16} />,      href: "/student/quizzes",      always: false },
    { label: "Jadwal",        icon: <CalendarDays size={16} />,    href: "/student/schedules",    always: false },
    { label: "Presensi",      icon: <Users size={16} />,           href: "/student/attendance",   always: false },
    { label: "Sertifikat",    icon: <Award size={16} />,           href: "/student/certificates", always: false },
  ];

  const navItems = allItems.filter(item => item.always || hasPkg);

  return (
    <BaseSidebar
      name={name}
      email={email}
      roleLabel="Siswa"
      homeHref="/student"
      navItems={navItems}
      settingsHref="/student/settings"
      logoutMessage="Yakin ingin keluar?"
    />
  );
}
