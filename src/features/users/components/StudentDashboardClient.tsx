"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, BookOpen, ClipboardList, HelpCircle,
  PlaySquare, Award, Settings, LogOut, CheckCircle, Clock
} from "lucide-react";
import { IslamicPanel, IslamicCard } from "@/shared/components/ui/IslamicPanel";

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

interface PackageInfo {
  enrollmentId: string;
  status: string;
  startedAt: string;
  expiresAt: string | null;
  daysRemaining: number | null;
  isExpired: boolean;
  package: {
    id: string;
    name: string;
    description: string | null;
    defaultLessonLimit: number;
  };
}

interface DashboardData {
  student: { name: string; email: string };
  assignments: Assignment[];
  certificates: Certificate[];
  enrollments: Enrollment[];
  quizzes: Quiz[];
  packageData?: {
    activePackages: PackageInfo[];
    hasActivePackage: boolean;
  };
}

// No Mock Data anymore
const MOCK_DATA: DashboardData = {
  student: { name: "Siswa", email: "" },
  assignments: [],
  certificates: [],
  enrollments: [],
  quizzes: [],
};

// ─── Nav Config ───────────────────────────────────────────────────────────────

type NavKey = "overview" | "enrollments" | "assignments" | "quizzes" | "certificates" | "materi" | "settings" | "packages";

const NAV_ITEMS: { key: NavKey; label: string; icon: React.ReactNode }[] = [
  { key: "overview",     label: "Overview",    icon: <LayoutDashboard size={16} /> },
  { key: "enrollments",  label: "Kursus Saya", icon: <BookOpen size={16} /> },
  { key: "assignments",  label: "Tugas",        icon: <ClipboardList size={16} /> },
  { key: "quizzes",      label: "Kuis",         icon: <HelpCircle size={16} /> },
  { key: "materi",       label: "Materi",       icon: <PlaySquare size={16} /> },
  { key: "certificates", label: "Sertifikat",   icon: <Award size={16} /> },
  { key: "settings",     label: "Pengaturan",   icon: <Settings size={16} /> },
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
    { label: "Kursus Aktif",   value: data.enrollments.length,  icon: <BookOpen size={18} />,      bg: "bg-blue-50",    text: "text-blue-600" },
    { label: "Tugas Pending",  value: pending,                   icon: <ClipboardList size={18} />, bg: "bg-amber-50",   text: "text-amber-600" },
    { label: "Kuis Mendatang", value: upcoming,                  icon: <HelpCircle size={18} />,    bg: "bg-violet-50",  text: "text-violet-600" },
    { label: "Sertifikat",     value: data.certificates.length,  icon: <Award size={18} />,         bg: "bg-emerald-50", text: "text-emerald-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Banner Paket */}
      {data.packageData && (
        <div className="mb-4">
          {!data.packageData.hasActivePackage ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-4">
              <div className="text-2xl mt-0.5">⚠️</div>
              <div>
                <h3 className="font-bold text-rose-800">Tidak ada paket belajar aktif</h3>
                <p className="text-sm text-rose-600 mt-1">
                  Materi premium terkunci karena kamu tidak memiliki paket belajar yang aktif, atau paket sebelumnya telah kedaluwarsa.
                </p>
                <button className="mt-3 text-xs font-bold text-white bg-rose-600 px-4 py-2 rounded-xl hover:bg-rose-700 transition">
                  Lihat Pilihan Paket
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {data.packageData.activePackages.map((pkg) => {
                const isExpiringSoon = pkg.daysRemaining !== null && pkg.daysRemaining <= 7;
                return (
                  <div key={pkg.enrollmentId} className={`rounded-2xl border p-4 flex items-center justify-between ${isExpiringSoon ? 'border-amber-200 bg-amber-50' : 'border-indigo-100 bg-indigo-50/50'}`}>
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{isExpiringSoon ? "⏳" : "💎"}</div>
                      <div>
                        <h3 className={`font-bold ${isExpiringSoon ? 'text-amber-800' : 'text-indigo-900'}`}>Paket {pkg.package.name} Aktif</h3>
                        <p className={`text-sm mt-0.5 ${isExpiringSoon ? 'text-amber-700' : 'text-indigo-600'}`}>
                          {pkg.expiresAt 
                            ? `Berakhir pada: ${new Date(pkg.expiresAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`
                            : 'Paket ini tidak memiliki masa kedaluwarsa.'}
                        </p>
                      </div>
                    </div>
                    {pkg.daysRemaining !== null && (
                      <div className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold ${isExpiringSoon ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-700'}`}>
                        Sisa {pkg.daysRemaining} Hari
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((card) => (
          <div key={card.label} className="group bg-white rounded-[40px] p-8 shadow-sm border border-white hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 ease-out">
            <div className="flex items-center justify-between mb-6">
               <div className="h-14 w-14 rounded-2xl bg-[#FAF9F6] flex items-center justify-center text-2xl group-hover:bg-[#0B213F] group-hover:text-white transition-colors duration-500">
                  {card.icon}
               </div>
               <span className="text-2xl font-black text-[#0B213F] tracking-tight">{card.value}</span>
            </div>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{card.label}</p>
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
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [enrollRes, assignRes, quizRes, certRes, meRes, pkgRes] = await Promise.all([
          fetch("/api/enrollments", { credentials: "include" }),
          fetch("/api/assignments", { credentials: "include" }),
          fetch("/api/quizzes", { credentials: "include" }),
          fetch("/api/certificates", { credentials: "include" }),
          fetch("/api/auth/me", { credentials: "include" }),
          fetch("/api/student/my-packages", { credentials: "include" }),
        ]);

        const enrollData = enrollRes.ok ? await enrollRes.json() : { enrollments: [] };
        const assignData = assignRes.ok ? await assignRes.json() : { assignments: [] };
        const quizData = quizRes.ok ? await quizRes.json() : { quizzes: [] };
        const certData = certRes.ok ? await certRes.json() : { certificates: [] };
        const meData = meRes.ok ? await meRes.json() : { user: { name: "Siswa", email: "" } };
        const pkgData = pkgRes.ok ? await pkgRes.json() : null;

        const pkgInfo = pkgData ? {
          activePackages: pkgData.activePackages ?? [],
          hasActivePackage: pkgData.hasActivePackage ?? false,
        } : { activePackages: [], hasActivePackage: false };

        if (!pkgInfo.hasActivePackage) {
          router.push("/student/packages");
          return;
        }

        setData({
          student: { name: meData.user?.name ?? "Siswa", email: meData.user?.email ?? "" },
          packageData: pkgInfo,
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
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#8B0000] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-medium text-sm">Menyiapkan dashboard…</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const pendingAssignments = data.assignments.filter(a => a.status === "pending");
  const activeEnrollments = data.enrollments.filter(e => e.progress < 100);

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-10 lg:p-16">
      <div className="max-w-7xl mx-auto">
        
        {/* ── Top Header ────────────────────────────────────────────────── */}
         <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
            <div>
               <h1 className="text-4xl md:text-6xl font-black text-[#0B213F] tracking-tighter leading-none">
                  SABTU <span className="text-[#D4AF37]">BAROKAH.</span>
               </h1>
               <p className="text-slate-400 font-bold mt-4 uppercase tracking-[0.3em] text-[10px]">Student Dashboard · Haneen Academy</p>
            </div>
            <div className="flex items-center gap-4 flex-1 max-w-xl">
             <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="Cari materi, kuis, atau tugas..." 
                  className="w-full bg-white border-none rounded-2xl py-3.5 pl-12 pr-4 shadow-sm text-sm focus:ring-2 focus:ring-[#D4AF37] transition-all"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </div>
             </div>
             <button className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-[#0B213F] shadow-sm hover:bg-[#D4AF37] hover:text-white transition-all">
                <Settings size={20} />
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ── Main Content (Left) ────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. Profile Detail Card */}
            <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-sm border border-white flex flex-col md:flex-row gap-10 relative overflow-hidden">
               {/* Decorative Background Element */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#FAF9F6] rounded-bl-[100px] -mr-10 -mt-10" />
               
               <div className="relative shrink-0">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-[#F9F6EE] overflow-hidden shadow-xl">
                     <img 
                       src={data.student.email === "admin@haneen.id" ? "/admin-avatar.jpg" : "https://api.dicebear.com/7.x/avataaars/svg?seed=" + data.student.name} 
                       alt={data.student.name}
                       className="w-full h-100 object-cover bg-[#0B213F]"
                     />
                  </div>
                  <button className="absolute bottom-2 right-2 h-10 w-10 bg-white rounded-full shadow-lg flex items-center justify-center text-[#0B213F] border border-slate-100 hover:scale-110 transition-transform">
                     <Settings size={16} />
                  </button>
               </div>

               <div className="flex-1">
                     <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className="bg-[#0B213F] text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Premium Member</span>
                        <span className="bg-[#D4AF37] text-[#0B213F] text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest italic">Akselerasi UTBK</span>
                     </div>
                     <h2 className="text-4xl font-black text-[#0B213F] tracking-tighter mb-2">{data.student.name}</h2>
                     <p className="text-slate-400 font-bold text-sm tracking-wide">{data.student.email}</p>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm mt-8">
                        <div className="space-y-1">
                           <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Tanggal Registrasi</p>
                           <p className="text-[#0B213F] font-bold">12 Januari 2026</p>
                        </div>
                        <div className="space-y-1">
                           <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Negara, Kota</p>
                           <p className="text-[#0B213F] font-bold">Indonesia, Jakarta</p>
                        </div>
                     </div>
               </div>
            </div>

            {/* 2. Course Timeline */}
            <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-sm border border-white">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-[#0B213F]">Kursus Saya</h3>
                  <Link href="/student/enrollments" className="text-xs font-bold text-[#D4AF37] hover:underline">Lihat Semua</Link>
               </div>

               <div className="relative pl-8 space-y-6">
                  {/* Vertical Line */}
                  <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-[#F0F2F9]" />
                  
                  {data.enrollments.length > 0 ? data.enrollments.map((e, idx) => {
                    const colors = [
                      "bg-indigo-50 border-indigo-100 text-indigo-700 shadow-indigo-100/50",
                      "bg-rose-50 border-rose-100 text-rose-700 shadow-rose-100/50",
                      "bg-emerald-50 border-emerald-100 text-emerald-700 shadow-emerald-100/50"
                    ];
                    const color = colors[idx % colors.length];
                    
                    return (
                      <div key={e.id} className="relative flex items-center group">
                        {/* Dot on Line */}
                        <div className="absolute -left-[25px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 border-white bg-[#0B213F] shadow-sm z-10" />
                        
                        <div className={`flex-1 flex flex-col md:flex-row items-center justify-between gap-4 p-6 rounded-3xl border transition-all duration-500 hover:scale-[1.02] ${color}`}>
                           <div className="flex-1 min-w-0">
                              <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">{e.instructor}</p>
                              <h4 className="text-lg font-black truncate">{e.courseName}</h4>
                           </div>
                           <div className="flex items-center gap-4 w-full md:w-auto shrink-0">
                              <div className="text-right">
                                 <p className="text-[10px] font-black uppercase opacity-60">Progres</p>
                                 <p className="text-lg font-black">{e.progress}%</p>
                              </div>
                              <button className="h-10 w-10 rounded-xl bg-white/50 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-sm">
                                 <PlaySquare size={18} />
                              </button>
                           </div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="p-10 text-center border-2 border-dashed border-slate-100 rounded-[30px]">
                       <p className="text-slate-400 font-medium">Belum ada kursus yang aktif.</p>
                    </div>
                  )}
               </div>
            </div>
          </div>

          {/* ── Widgets (Right) ───────────────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* 1. Payment Info Card */}
            <div className="bg-white rounded-[35px] p-8 shadow-sm border border-white">
               <h3 className="text-lg font-black text-[#0B213F] mb-6">Pembayaran</h3>
               <div className="space-y-4">
                  <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-slate-100">
                     <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Metode Utama</p>
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-12 bg-white rounded border flex items-center justify-center font-black text-[10px]">VISA</div>
                           <p className="text-sm font-bold text-[#0B213F]">**** 4590</p>
                        </div>
                        <Settings size={14} className="text-slate-300" />
                     </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                     {["visa", "mc", "gpay", "wu"].map(p => (
                        <div key={p} className="h-10 bg-[#FAF9F6] rounded-xl flex items-center justify-center text-[8px] font-black uppercase text-slate-300 border border-transparent hover:border-[#D4AF37] transition-all">{p}</div>
                     ))}
                  </div>
               </div>
            </div>

            {/* 2. Premium Subscription Card */}
            <div className="bg-[#0B213F] rounded-[35px] p-8 shadow-2xl relative overflow-hidden group">
               {/* Background Bird Motif */}
               <div className="absolute top-0 right-0 w-40 h-40 opacity-5 -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-700">
                  <svg width="100%" height="100%" viewBox="0 0 100 100" fill="white"><path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" /></svg>
               </div>

               <div className="relative z-10 space-y-6">
                  <div className="h-12 w-12 bg-[#D4AF37] rounded-2xl flex items-center justify-center text-[#0B213F] shadow-lg">
                     <Award size={24} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-white leading-tight">Berlangganan<br/>Haneen Premium</h3>
                     <p className="text-xs text-white/50 mt-2">Dapatkan akses eksklusif ke seluruh materi dan kuis intensif.</p>
                  </div>
                  <ul className="space-y-3">
                     {[
                       "Akses 100+ Materi Video",
                       "Sertifikat Digital Resmi",
                       "Konsultasi via WhatsApp",
                       "Potongan 50% Event Offline"
                     ].map(feat => (
                        <li key={feat} className="flex items-center gap-3 text-[11px] font-medium text-white/80">
                           <div className="h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
                           {feat}
                        </li>
                     ))}
                  </ul>
                  <Link href="/student/packages" className="block w-full bg-white text-[#0B213F] font-black text-xs py-4 rounded-2xl text-center shadow-xl hover:bg-[#D4AF37] hover:text-white transition-all transform hover:-translate-y-1">
                     Beli Paket Sekarang
                  </Link>
               </div>
            </div>

            {/* 3. Help Card */}
            <div className="bg-white rounded-[35px] p-8 border-2 border-dashed border-slate-100 flex flex-col items-center text-center">
               <div className="h-14 w-14 bg-amber-50 text-[#D4AF37] rounded-full flex items-center justify-center mb-4">
                  <HelpCircle size={28} />
               </div>
               <h4 className="font-black text-[#0B213F]">Punya Pertanyaan?</h4>
               <p className="text-xs text-slate-400 mt-2 leading-relaxed mb-6">Hubungi admin kami untuk bantuan teknis dan panduan belajar.</p>
               <a href="https://wa.me/6285704833249" className="text-xs font-black text-[#0B213F] hover:text-[#D4AF37] transition-colors underline">Chat WhatsApp</a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
