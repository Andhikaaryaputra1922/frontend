"use client";

import BaseSidebar from "./BaseSidebar";
import {
  LayoutDashboard, CalendarDays, Users, BookOpen,
  Video, ClipboardList, FileQuestion, LifeBuoy,
} from "lucide-react";

export default function TeacherSidebar({ name, role, image }: { name?: string; role: string; image?: string }) {
  const navItems = [
    { label: "Dashboard",      icon: <LayoutDashboard size={16} />, href: "/teacher" },
    { label: "Jadwal",         icon: <CalendarDays size={16} />,    href: "/teacher/schedules" },
    { label: "Presensi",       icon: <Users size={16} />,           href: "/teacher/attendance" },
    { label: "Kursus Saya",    icon: <BookOpen size={16} />,        href: "/teacher/courses" },
    { label: "Rekaman Kelas",  icon: <Video size={16} />,           href: "/teacher/materials" },
    { label: "Tugas",          icon: <ClipboardList size={16} />,   href: "/teacher/assignments" },
    { label: "Kuis",           icon: <FileQuestion size={16} />,    href: "/teacher/quizzes" },
    { label: "Pusat Bantuan",  icon: <LifeBuoy size={16} />,        href: "/teacher/help" },
  ];

  return (
    <BaseSidebar
      name={name}
      roleLabel="Pengajar"
      homeHref="/teacher"
      navItems={navItems}
      settingsHref="/teacher/settings"
      logoutMessage="Keluar dari Panel Pengajar?"
    />
  );
}
