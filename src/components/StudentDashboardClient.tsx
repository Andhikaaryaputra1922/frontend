"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Assignment {
  id: string;
  title: string;
  courseName: string;
  dueDate: string;
  status: "pending" | "submitted" | "graded";
  grade?: number;
}

interface Certificate {
  id: string;
  courseName: string;
  issuedAt: string;
  downloadUrl?: string;
}

interface Enrollment {
  id: string;
  courseName: string;
  progress: number;
  instructor: string;
}

interface Quiz {
  id: string;
  title: string;
  courseName: string;
  dueDate: string;
  status: "upcoming" | "completed";
  score?: number;
  totalQuestions: number;
}

interface DashboardData {
  student: { name: string; email: string };
  assignments: Assignment[];
  certificates: Certificate[];
  enrollments: Enrollment[];
  quizzes: Quiz[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_DATA: DashboardData = {
  student: { name: "Ahmad Fauzi", email: "ahmad@example.com" },
  assignments: [
    { id: "1", title: "Essay: Sejarah Islam", courseName: "Sejarah Peradaban", dueDate: "2026-05-15", status: "pending" },
    { id: "2", title: "Laporan Praktikum Kimia", courseName: "Kimia Dasar", dueDate: "2026-05-10", status: "submitted" },
    { id: "3", title: "Analisis Puisi", courseName: "Bahasa Indonesia", dueDate: "2026-04-30", status: "graded", grade: 88 },
  ],
  certificates: [
    { id: "1", courseName: "Matematika Dasar", issuedAt: "2026-03-20" },
    { id: "2", courseName: "Pengantar Pemrograman", issuedAt: "2026-02-14" },
  ],
  enrollments: [
    { id: "1", courseName: "Kimia Dasar", progress: 65, instructor: "Dr. Siti Rahayu" },
    { id: "2", courseName: "Sejarah Peradaban", progress: 40, instructor: "Ustadz Hasan" },
    { id: "3", courseName: "Bahasa Indonesia", progress: 90, instructor: "Bu Kartini" },
    { id: "4", courseName: "Fisika Modern", progress: 20, instructor: "Prof. Budi" },
  ],
  quizzes: [
    { id: "1", title: "Quiz Bab 3", courseName: "Kimia Dasar", dueDate: "2026-05-12", status: "upcoming", totalQuestions: 20 },
    { id: "2", title: "Ulangan Harian", courseName: "Sejarah Peradaban", dueDate: "2026-05-08", status: "completed", score: 85, totalQuestions: 15 },
  ],
};

// ─── Nav Config ───────────────────────────────────────────────────────────────

type NavKey = "overview" | "enrollments" | "assignments" | "quizzes" | "certificates" | "settings";

const NAV_ITEMS: { key: NavKey; label: string; icon: string }[] = [
  { key: "overview",     label: "Overview",    icon: "🏠" },
  { key: "enrollments",  label: "Kursus Saya", icon: "📚" },
  { key: "assignments",  label: "Tugas",        icon: "📝" },
  { key: "quizzes",      label: "Kuis",         icon: "❓" },
  { key: "certificates", label: "Sertifikat",   icon: "🏅" },
  { key: "settings",     label: "Pengaturan",   icon: "⚙️" },
];

// ─── Shared UI ────────────────────────────────────────────────────────────────

function ProgressBar({ value }: { value: number }) {
  const color = value >= 75 ? "bg-emerald-500" : value >= 40 ? "bg-amber-400" : "bg-rose-400";
  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
      <div className={`h-1.5 rounded-full transition-all duration-700 ${color}`} style={{ width: `${value}%` }} />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending:   "bg-amber-100 text-amber-700",
    submitted: "bg-blue-100 text-blue-700",
    graded:    "bg-emerald-100 text-emerald-700",
    upcoming:  "bg-violet-100 text-violet-700",
    completed: "bg-slate-100 text-slate-600",
  };
  const labels: Record<string, string> = {
    pending:   "Belum Dikumpul",
    submitted: "Sudah Dikumpul",
    graded:    "Sudah Dinilai",
    upcoming:  "Akan Datang",
    completed: "Selesai",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status] ?? "bg-slate-100 text-slate-500"}`}>
      {labels[status] ?? status}
    </span>
  );
}

// ─── Pages ────────────────────────────────────────────────────────────────────

function OverviewPage({ data }: { data: DashboardData }) {
  const pending  = data.assignments.filter((a) => a.status === "pending").length;
  const upcoming = data.quizzes.filter((q) => q.status === "upcoming").length;

  const stats = [
    { label: "Kursus Aktif",   value: data.enrollments.length,  icon: "📚", bg: "bg-teal-50",    text: "text-teal-700" },
    { label: "Tugas Pending",  value: pending,                   icon: "📝", bg: "bg-amber-50",   text: "text-amber-700" },
    { label: "Kuis Mendatang", value: upcoming,                  icon: "❓", bg: "bg-violet-50",  text: "text-violet-700" },
    { label: "Sertifikat",     value: data.certificates.length,  icon: "🏅", bg: "bg-emerald-50", text: "text-emerald-700" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${s.bg}`}>{s.icon}</div>
            <div>
              <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-3">Kursus Aktif</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.enrollments.slice(0, 4).map((e) => (
            <div key={e.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex justify-between items-start">
                <p className="font-semibold text-slate-800 text-sm">{e.courseName}</p>
                <span className="text-sm font-bold text-teal-600">{e.progress}%</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{e.instructor}</p>
              <ProgressBar value={e.progress} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-3">Tugas Terbaru</h2>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-50">
          {data.assignments.slice(0, 3).map((a) => (
            <Link key={a.id} href={`/student/assignments/${a.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
              <div>
                <p className="font-medium text-slate-800 text-sm">{a.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{a.courseName} · {a.dueDate}</p>
              </div>
              <div className="flex items-center gap-2">
                {a.grade !== undefined && <span className="text-sm font-bold text-emerald-600">{a.grade}</span>}
                <StatusBadge status={a.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function EnrollmentsPage({ enrollments }: { enrollments: Enrollment[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {enrollments.map((e) => (
        <div key={e.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <p className="font-semibold text-slate-800">{e.courseName}</p>
            <span className="text-sm font-bold text-teal-600">{e.progress}%</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{e.instructor}</p>
          <ProgressBar value={e.progress} />
        </div>
      ))}
    </div>
  );
}

function AssignmentsPage({ assignments }: { assignments: Assignment[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-50">
      {assignments.map((a) => (
        <Link key={a.id} href={`/student/assignments/${a.id}`}
          className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
          <div>
            <p className="font-medium text-slate-800 text-sm">{a.title}</p>
            <p className="text-xs text-slate-400 mt-0.5">{a.courseName} · Tenggat: {a.dueDate}</p>
          </div>
          <div className="flex items-center gap-2">
            {a.grade !== undefined && <span className="text-sm font-bold text-emerald-600">{a.grade}</span>}
            <StatusBadge status={a.status} />
          </div>
        </Link>
      ))}
    </div>
  );
}

function QuizzesPage({ quizzes }: { quizzes: Quiz[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-50">
      {quizzes.map((q) => (
        <Link key={q.id} href={`/student/quizzes/${q.id}`}
          className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
          <div>
            <p className="font-medium text-slate-800 text-sm">{q.title}</p>
            <p className="text-xs text-slate-400 mt-0.5">{q.courseName} · {q.totalQuestions} soal</p>
          </div>
          <div className="flex items-center gap-2">
            {q.score !== undefined && <span className="text-sm font-bold text-violet-600">{q.score}</span>}
            <StatusBadge status={q.status} />
          </div>
        </Link>
      ))}
    </div>
  );
}

function CertificatesPage({ certificates }: { certificates: Certificate[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {certificates.map((c) => (
        <div key={c.id} className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="text-3xl">🏅</div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 truncate">{c.courseName}</p>
            <p className="text-xs text-slate-500 mt-0.5">Diterbitkan: {c.issuedAt}</p>
          </div>
          {c.downloadUrl && (
            <a href={c.downloadUrl} className="text-xs text-teal-600 font-semibold hover:underline">Unduh</a>
          )}
        </div>
      ))}
    </div>
  );
}

function SettingsPage({ student }: { student: DashboardData["student"] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4 max-w-md">
      <div>
        <label className="text-xs font-semibold text-slate-500 block mb-1">Nama</label>
        <input defaultValue={student.name}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400" />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-500 block mb-1">Email</label>
        <input defaultValue={student.email}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400" />
      </div>
      <button className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
        Simpan Perubahan
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function StudentDashboardClient() {
  const router = useRouter();
  const [data, setData]           = useState<DashboardData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [activeNav, setActiveNav] = useState<NavKey>("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [enrollRes, assignRes, quizRes, certRes, meRes] = await Promise.all([
          fetch("/api/enrollments", { credentials: "include" }),
          fetch("/api/assignments", { credentials: "include" }),
          fetch("/api/quizzes", { credentials: "include" }),
          fetch("/api/certificates", { credentials: "include" }),
          fetch("/api/auth/me", { credentials: "include" }),
        ]);

        const enrollData = enrollRes.ok ? await enrollRes.json() : { enrollments: [] };
        const assignData = assignRes.ok ? await assignRes.json() : { assignments: [] };
        const quizData = quizRes.ok ? await quizRes.json() : { quizzes: [] };
        const certData = certRes.ok ? await certRes.json() : { certificates: [] };
        const meData = meRes.ok ? await meRes.json() : { user: { name: "Siswa", email: "" } };

        setData({
          student: { name: meData.user?.name ?? "Siswa", email: meData.user?.email ?? "" },
          enrollments: (enrollData.enrollments ?? []).map((e: any) => ({
            id: e.id,
            courseName: e.course?.title ?? "",
            progress: Math.round(e.progress ?? 0),
            instructor: e.course?.teacher?.name ?? "Pengajar",
          })),
          assignments: (assignData.assignments ?? []).map((a: any) => ({
            id: a.id,
            title: a.title,
            courseName: a.course?.title ?? "",
            dueDate: a.dueDate,
            status: "pending",
          })),
          quizzes: (quizData.quizzes ?? []).map((q: any) => ({
            id: q.id,
            title: q.title,
            courseName: q.course?.title ?? "",
            dueDate: "",
            status: "upcoming",
            totalQuestions: q.questions?.length ?? 0,
          })),
          certificates: (certData.certificates ?? []).map((c: any) => ({
            id: c.id,
            courseName: c.course?.title ?? "",
            issuedAt: c.issuedAt,
            downloadUrl: c.pdfUrl,
          })),
        });
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setData(MOCK_DATA);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Memuat dashboard…</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const pageTitle = NAV_ITEMS.find((n) => n.key === activeNav)?.label ?? "Dashboard";

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* ── Sidebar ─────────────────────────────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 flex flex-col bg-white border-r border-slate-100 shadow-sm
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-16" : "w-60"}
        `}
      >
        {/* Header */}
        <div className={`flex items-center border-b border-slate-100 px-3 py-4 ${collapsed ? "justify-center" : "justify-between px-4"}`}>
          {!collapsed && (
            <span className="text-teal-600 font-bold text-base tracking-tight truncate">Haneen Academy</span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 transition-colors flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            )}
          </button>
        </div>

        {/* Avatar */}
        <div className={`flex items-center gap-3 border-b border-slate-100 py-4 ${collapsed ? "justify-center px-2" : "px-4"}`}>
          <div className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {data.student.name.charAt(0)}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{data.student.name}</p>
              <p className="text-xs text-slate-400 truncate">{data.student.email}</p>
            </div>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = activeNav === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveNav(item.key)}
                title={collapsed ? item.label : undefined}
                className={`
                  w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all
                  ${collapsed ? "justify-center" : ""}
                  ${active ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"}
                `}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-2 py-3 border-t border-slate-100">
          <button
            title={collapsed ? "Keluar" : undefined}
            onClick={async () => {
              if (logoutLoading) return;
              if (!confirm("Yakin ingin keluar?")) return;
              setLogoutLoading(true);
              try {
                const res = await fetch("/api/auth/logout", {
                  method: "POST",
                  credentials: "include",
                });
                if (res.ok) {
                  router.push("/login");
                  router.refresh();
                } else {
                  alert("Logout gagal. Silakan coba lagi.");
                }
              } catch {
                alert("Logout gagal. Silakan coba lagi.");
              } finally {
                setLogoutLoading(false);
              }
            }}
            disabled={logoutLoading}
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors ${collapsed ? "justify-center" : ""}`}
          >
            <span className="text-lg flex-shrink-0">🚪</span>
            {!collapsed && <span>{logoutLoading ? "Keluar..." : "Keluar"}</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? "ml-16" : "ml-60"}`}>

        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm">
          <h1 className="text-lg font-bold text-slate-800">{pageTitle}</h1>
          <span className="text-sm text-slate-400 hidden sm:block">
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </span>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {activeNav === "overview"     && <OverviewPage data={data} />}
          {activeNav === "enrollments"  && <EnrollmentsPage enrollments={data.enrollments} />}
          {activeNav === "assignments"  && <AssignmentsPage assignments={data.assignments} />}
          {activeNav === "quizzes"      && <QuizzesPage quizzes={data.quizzes} />}
          {activeNav === "certificates" && <CertificatesPage certificates={data.certificates} />}
          {activeNav === "settings"     && <SettingsPage student={data.student} />}
        </main>
      </div>
    </div>
  );
}
