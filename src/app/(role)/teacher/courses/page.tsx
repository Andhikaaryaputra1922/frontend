"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, BookOpen, Layers, Users, LayoutGrid, List as ListIcon } from "lucide-react";
import { Toast } from "@/shared/components/ui/PremiumFeedback";
import TeacherPageLayout, {
  TeacherButton, TeacherSearch, TeacherEmptyState, TeacherStatusBadge,
} from "@/features/users/components/layouts/TeacherPageLayout";

type Course = {
  id: string; title: string; thumbnailUrl: string | null;
  category: string; level: string; status: string; accessType: string;
  _count: { chapters: number; enrollments: number };
};

export default function TeacherCoursesPage() {
  const [courses, setCourses]   = useState<Course[]>([]);
  const [loading, setLoading]   = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch]     = useState("");
  const [toast, setToast]       = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetch("/api/teacher/courses", { credentials: "include" })
      .then(r => r.json())
      .then(d => setCourses(d.courses || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <TeacherPageLayout
      title="Kursus Saya"
      subtitle="Kelola bab dan materi untuk kursus yang ditugaskan kepada Anda."
      action={
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode("grid")}
            className={`p-2.5 rounded-xl transition-all ${viewMode === "grid" ? "bg-[#0B213F] text-white" : "border border-slate-200 text-slate-400 hover:bg-slate-50"}`}>
            <LayoutGrid size={15} />
          </button>
          <button onClick={() => setViewMode("list")}
            className={`p-2.5 rounded-xl transition-all ${viewMode === "list" ? "bg-[#0B213F] text-white" : "border border-slate-200 text-slate-400 hover:bg-slate-50"}`}>
            <ListIcon size={15} />
          </button>
        </div>
      }
    >
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Search */}
      <div className="w-full sm:w-80">
        <TeacherSearch value={search} onChange={setSearch} placeholder="Cari kursus atau kategori..." />
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="h-40 bg-slate-100 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-slate-100 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <TeacherEmptyState icon={<BookOpen size={28} />} title="Belum ada kursus" subtitle="Kursus akan muncul setelah admin menugaskan." />
      ) : viewMode === "grid" ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(c => (
            <div key={c.id} className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col">
              {/* Thumbnail */}
              <div className="relative h-40 bg-[#0B213F] overflow-hidden shrink-0">
                {c.thumbnailUrl ? (
                  <img src={c.thumbnailUrl} alt={c.title} className="h-full w-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <BookOpen size={28} className="text-[#D4AF37]/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B213F]/50 to-transparent" />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <TeacherStatusBadge status={c.status} />
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wide">{c.category}</span>
                  <span className="text-slate-200">·</span>
                  <span className="text-[10px] font-medium text-slate-400">{c.level}</span>
                </div>
                <h3 className="text-[13px] font-bold text-slate-800 line-clamp-2 leading-snug mb-3">{c.title}</h3>
                <div className="flex items-center gap-3 mb-4 mt-auto">
                  <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                    <Layers size={11} /> {c._count.chapters} bab
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                    <Users size={11} /> {c._count.enrollments} siswa
                  </span>
                </div>
                <Link href={`/teacher/courses/${c.id}/content`}
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-[#0B213F] text-[#D4AF37] text-[11px] font-bold hover:opacity-90 transition-all">
                  Atur Kurikulum →
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <div key={c.id} className="flex items-center gap-4 bg-white rounded-2xl border border-slate-200 px-5 py-4 shadow-sm hover:shadow-md transition-all">
              <div className="h-12 w-16 rounded-xl bg-[#0B213F] overflow-hidden shrink-0">
                {c.thumbnailUrl && <img src={c.thumbnailUrl} alt={c.title} className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[13px] font-bold text-slate-800 truncate">{c.title}</h3>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[10px] font-bold text-[#D4AF37]">{c.category}</span>
                  <span className="text-[10px] text-slate-400">{c._count.enrollments} siswa · {c._count.chapters} bab</span>
                </div>
              </div>
              <TeacherStatusBadge status={c.status} />
              <Link href={`/teacher/courses/${c.id}/content`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B213F] text-[#D4AF37] text-[11px] font-bold hover:opacity-90 shrink-0">
                Atur →
              </Link>
            </div>
          ))}
        </div>
      )}
    </TeacherPageLayout>
  );
}
