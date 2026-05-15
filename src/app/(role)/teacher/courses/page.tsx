"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit3, Trash2, BookOpen, Layers, Globe, Clock, Award, MoreVertical, Search, Filter, LayoutGrid, List as ListIcon } from "lucide-react";
import BackButton from "@/shared/components/ui/BackButton";
import { Toast } from "@/shared/components/ui/PremiumFeedback";

type Course = {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  category: string;
  level: string;
  price: number;
  status: string;
  accessType: string;
  _count: { chapters: number; enrollments: number };
};

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/teacher/courses", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#FDFDFD] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block h-1.5 w-8 rounded-full bg-[#8B0000]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B0000]">Tugas Mengajar</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900">
                Kursus Saya
              </h1>
              <p className="mt-2 text-sm text-slate-500 max-w-md">
                Kelola bab dan materi untuk kursus yang telah ditugaskan kepada Anda oleh Administrator.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <BackButton />
            </div>
          </div>

          <div className="mt-10 flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-white rounded-[32px] border border-slate-100 shadow-sm">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                placeholder="Cari kursus atau kategori..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-6 py-3 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-[#8B0000] transition-all text-sm font-bold outline-none"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-[#8B0000] text-white' : 'hover:bg-slate-50 text-slate-400'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-[#8B0000] text-white' : 'hover:bg-slate-50 text-slate-400'}`}
              >
                <ListIcon size={18} />
              </button>
              <div className="h-8 w-px bg-slate-100 mx-2" />
              <button className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all">
                <Filter size={14} /> Filter
              </button>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <div key={i} className="h-80 rounded-[40px] bg-slate-50 animate-pulse" />)}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-6">
              <BookOpen size={48} />
            </div>
            <p className="text-xl font-black text-slate-400 uppercase tracking-widest">Kursus Kosong</p>
            <p className="text-sm text-slate-300 mt-2">Mulai langkah pertama Anda dengan membuat kursus menarik.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <div key={course.id} className="group relative flex flex-col rounded-[48px] border border-slate-100 bg-white p-6 hover:border-[#8B0000]/30 hover:shadow-2xl transition-all duration-500 overflow-hidden">
                {/* Thumbnail */}
                <div className="aspect-[4/3] w-full rounded-[32px] bg-slate-100 mb-6 overflow-hidden relative">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200 font-black text-4xl bg-slate-50">H.</div>
                  )}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] shadow-lg backdrop-blur-md ${course.status === 'PUBLISHED' ? 'bg-emerald-500 text-white' : 'bg-slate-900/80 text-white'}`}>
                      {course.status}
                    </span>
                    <span className="px-4 py-1.5 rounded-full bg-[#E5B54F] text-white text-[9px] font-black uppercase tracking-[0.15em] shadow-lg">
                      {course.accessType}
                    </span>
                  </div>
                </div>

                <div className="px-2 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#8B0000]">{course.category}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-200" />
                    <span className="text-[10px] font-bold text-slate-400">{course.level}</span>
                  </div>

                  <h3 className="text-xl font-black text-slate-800 mb-4 line-clamp-2 leading-tight group-hover:text-[#8B0000] transition-colors">{course.title}</h3>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center gap-2">
                      <Layers size={14} className="text-slate-300" />
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{course._count.chapters} Bab</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen size={14} className="text-slate-300" />
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{course._count.enrollments} Siswa</p>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-end">
                    <Link
                      href={`/teacher/courses/${course.id}/content`}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest hover:bg-[#8B0000] transition-all"
                    >
                      Atur Kurikulum
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* List View Implementation */}
            {filteredCourses.map(course => (
              <div key={course.id} className="flex items-center gap-6 p-6 rounded-[32px] border border-slate-100 bg-white hover:border-[#8B0000]/20 transition-all group">
                <div className="h-20 w-32 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
                  {course.thumbnailUrl && <img src={course.thumbnailUrl} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-black text-slate-800 truncate">{course.title}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#8B0000]">{course.category}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{course.level}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{course._count.enrollments} Siswa</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link href={`/teacher/courses/${course.id}/content`} className="px-4 py-2 rounded-xl bg-[#8B0000] text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-800">Atur Kurikulum</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
