"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { PremiumModal, Toast } from "@/shared/components/ui/PremiumFeedback";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  level: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  price: number;
  isPremium: boolean;
  createdAt: string;
  teacherId: string | null;
  teacher: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  _count: {
    lessons: number;
    enrollments: number;
  };
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Status Update State
  const [statusModal, setStatusModal] = useState<{ isOpen: boolean; courseId: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | null }>({
    isOpen: false,
    courseId: "",
    status: null
  });
  const [updating, setUpdating] = useState(false);

  // Deletion State
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; courseId: string; title: string }>({
    isOpen: false,
    courseId: "",
    title: ""
  });
  const [deleting, setDeleting] = useState(false);

  // Teacher Assignment States
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [selectedCourseForTeacher, setSelectedCourseForTeacher] = useState<Course | null>(null);
  const [teachers, setTeachers] = useState<{ id: string; name: string; email: string }[]>([]);
  const [assigning, setAssigning] = useState(false);

  // Course CRUD States
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [courseFormData, setCourseFormData] = useState({
    id: "",
    title: "",
    slug: "",
    description: "",
    category: "",
    level: "BEGINNER",
    price: 0,
    isPremium: false,
    teacherId: "",
  });
  const [savingCourse, setSavingCourse] = useState(false);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/courses", { credentials: "include" });
      if (res.ok) {
        const d = await res.json();
        setCourses(d.courses ?? []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await fetch("/api/admin/users?role=TEACHER", { credentials: "include" });
      if (res.ok) {
        const d = await res.json();
        setTeachers(d.users ?? []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
  }, [fetchCourses]);

  const handleUpdateStatus = async () => {
    if (!statusModal.courseId || !statusModal.status || updating) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/courses/${statusModal.courseId}/status`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: statusModal.status }),
      });
      if (res.ok) {
        setToast({ message: `Status berhasil diubah menjadi ${statusModal.status}`, type: "success" });
        setStatusModal({ isOpen: false, courseId: "", status: null });
        fetchCourses();
      } else {
        const err = await res.json();
        setToast({ message: err.message || "Gagal mengubah status", type: "error" });
      }
    } catch {
      setToast({ message: "Kesalahan jaringan", type: "error" });
    } finally {
      setUpdating(false);
    }
  };

  const assignTeacher = async (teacherId: string | null) => {
    if (!selectedCourseForTeacher) return;
    setAssigning(true);
    try {
      const res = await fetch(`/api/admin/courses/${selectedCourseForTeacher.id}/teacher`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId }),
      });
      if (res.ok) {
        setToast({ message: "Pengajar berhasil ditugaskan", type: "success" });
        setShowTeacherModal(false);
        fetchCourses();
      } else {
        const err = await res.json();
        setToast({ message: err.message || "Gagal menugaskan pengajar", type: "error" });
      }
    } catch {
      setToast({ message: "Kesalahan jaringan", type: "error" });
    } finally {
      setAssigning(false);
    }
  };

  const openAddCourse = () => {
    setIsEditingCourse(false);
    setCourseFormData({
      id: "",
      title: "",
      slug: "",
      description: "",
      category: "",
      level: "BEGINNER",
      price: 0,
      isPremium: false,
      teacherId: teachers[0]?.id || "",
    });
    setShowCourseModal(true);
  };

  const openEditCourse = (c: Course) => {
    setIsEditingCourse(true);
    setCourseFormData({
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.description || "",
      category: c.category,
      level: c.level,
      price: c.price,
      isPremium: c.isPremium,
      teacherId: c.teacherId || "",
    });
    setShowCourseModal(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCourse(true);
    try {
      const url = isEditingCourse ? `/api/admin/courses/${courseFormData.id}` : "/api/courses";
      const method = isEditingCourse ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseFormData),
      });
      if (res.ok) {
        setToast({ message: `Kursus berhasil ${isEditingCourse ? "diperbarui" : "diterbitkan"}!`, type: "success" });
        setShowCourseModal(false);
        fetchCourses();
      } else {
        const err = await res.json();
        setToast({ message: err.message || "Gagal menyimpan kursus", type: "error" });
      }
    } catch {
      setToast({ message: "Kesalahan jaringan", type: "error" });
    } finally {
      setSavingCourse(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!deleteModal.courseId || deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/courses/${deleteModal.courseId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setToast({ message: "Kursus berhasil dihapus", type: "success" });
        setDeleteModal({ isOpen: false, courseId: "", title: "" });
        fetchCourses();
      } else {
        const err = await res.json();
        setToast({ message: err.message || "Gagal menghapus kursus", type: "error" });
      }
    } catch {
      setToast({ message: "Kesalahan jaringan", type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const filteredCourses = courses.filter((c) => {
    if (activeTab !== "ALL" && c.status !== activeTab) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        (c.teacher?.name && c.teacher.name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const tabs = [
    { key: "ALL", label: "Semua" },
    { key: "PUBLISHED", label: "Published" },
    { key: "DRAFT", label: "Draft" },
    { key: "ARCHIVED", label: "Diarsipkan" },
  ];

  return (
    <main className="min-h-screen bg-[var(--base)] px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[40px] border border-slate-200 bg-white p-7 md:p-10 shadow-sm">
          
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <Link href="/admin" className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Admin Panel
              </Link>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                Moderasi Course
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Kelola mata pelajaran, tugaskan pengajar, dan moderasi konten.
              </p>
            </div>
            <button 
              onClick={openAddCourse}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#8B0000] px-6 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-[#8B0000]/20 hover:bg-[#6B0000] transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Tambah Mapel Baru
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between mb-6">
            <div className="flex flex-wrap gap-2">
              {tabs.map(t => (
                <button key={t.key} onClick={() => setActiveTab(t.key)}
                  className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all border ${activeTab === t.key ? "bg-[#1A2E44] text-[#E5B54F] border-[#E5B54F]/50 shadow-md" : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"}`}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="w-full sm:w-64 relative">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama course/guru..."
                className="w-full rounded-full border border-slate-100 bg-slate-50 px-4 py-3 pl-10 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20 focus:border-[#8B0000] transition-all" />
              <svg className="absolute left-3.5 top-3.5 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-3xl border border-slate-50 shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                <tr>
                  <th className="px-6 py-6">Informasi Course</th>
                  <th className="px-6 py-6">Status Pengajar</th>
                  <th className="px-6 py-6">Metrik & Status</th>
                  <th className="px-6 py-6 text-right">Moderasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white">
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-16 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">Memproses data akademik...</td></tr>
                ) : filteredCourses.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-16 text-center text-[10px] font-black uppercase tracking-widest text-slate-300">Data tidak ditemukan</td></tr>
                ) : (
                  filteredCourses.map((c) => (
                    <tr key={c.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-1.5">
                          <p className="font-black text-slate-800 text-lg tracking-tight leading-none">{c.title}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white bg-[#1A2E44] px-2.5 py-1 rounded-md">{c.category}</span>
                            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">{c.level}</span>
                            {c.isPremium && <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#1A2E44] bg-[#E5B54F] px-2.5 py-1 rounded-md shadow-sm">PREMIUM</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1A2E44] border-2 border-[#E5B54F]/20 text-[#E5B54F] text-sm font-black shadow-md group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                            {c.teacher?.image ? (
                              <img src={c.teacher.image} alt={c.teacher.name || "Guru"} className="h-full w-full object-cover" />
                            ) : (
                              c.teacher?.name?.charAt(0).toUpperCase() || "?"
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-black text-slate-800 truncate mb-1">{c.teacher?.name || "Tanpa Guru"}</p>
                            <button 
                              onClick={() => { setSelectedCourseForTeacher(c); setShowTeacherModal(true); }}
                              className="group/btn flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-[#1A2E44] hover:text-[#E5B54F] transition-all duration-200"
                            >
                              <svg className="group-hover/btn:rotate-180 transition-transform duration-500" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
                              Ganti Pengajar
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-2">
                          <span className={`w-fit px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${
                            c.status === "PUBLISHED" ? "bg-emerald-500 text-white" :
                            c.status === "ARCHIVED" ? "bg-rose-500 text-white" :
                            "bg-amber-400 text-white"
                          }`}>
                            {c.status}
                          </span>
                          <div className="flex items-center gap-3 text-slate-400">
                            <div className="flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg><span className="text-[10px] font-bold">{c._count.lessons}</span></div>
                            <div className="flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg><span className="text-[10px] font-bold">{c._count.enrollments}</span></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button onClick={() => openEditCourse(c)} className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-[#1A2E44] hover:text-[#E5B54F] transition-all duration-200 border border-slate-100 shadow-sm" title="Edit Detail">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>

                          <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100 gap-1">
                            {c.status !== "PUBLISHED" && (
                              <button onClick={() => setStatusModal({ isOpen: true, courseId: c.id, status: "PUBLISHED" })} className="rounded-lg bg-emerald-500/10 text-emerald-600 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all duration-200">
                                Publish
                              </button>
                            )}
                            {c.status !== "DRAFT" && (
                              <button onClick={() => setStatusModal({ isOpen: true, courseId: c.id, status: "DRAFT" })} className="rounded-lg bg-amber-500/10 text-amber-600 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all duration-200">
                                Draft
                              </button>
                            )}
                            {c.status !== "ARCHIVED" && (
                              <button onClick={() => setStatusModal({ isOpen: true, courseId: c.id, status: "ARCHIVED" })} className="rounded-lg bg-rose-500/10 text-rose-600 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all duration-200">
                                Arsip
                              </button>
                            )}
                          </div>
                          
                          <button onClick={() => setDeleteModal({ isOpen: true, courseId: c.id, title: c.title })} className="p-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-200 shadow-sm" title="Hapus Mapel">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Course Create/Edit Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A2E44]/60 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-[40px] bg-white p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-200 border-4 border-[#E5B54F]/10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-[#1A2E44] tracking-tight">{isEditingCourse ? "Edit Mata Pelajaran" : "Mata Pelajaran Baru"}</h2>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Akademik • Konten Management</p>
              </div>
              <button onClick={() => setShowCourseModal(false)} className="h-10 w-10 rounded-2xl hover:bg-rose-50 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all border border-slate-100">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Judul Mapel</label>
                  <input required value={courseFormData.title} onChange={e => setCourseFormData({...courseFormData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, "-")})}
                    placeholder="Contoh: UI/UX Design" className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-black text-slate-800 focus:ring-2 focus:ring-[#E5B54F]/20 focus:border-[#E5B54F] focus:bg-white outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">URL Slug</label>
                  <input required value={courseFormData.slug} onChange={e => setCourseFormData({...courseFormData, slug: e.target.value})}
                    placeholder="ui-ux-design" className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-black text-slate-800 focus:ring-2 focus:ring-[#E5B54F]/20 focus:border-[#E5B54F] focus:bg-white outline-none transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Kategori</label>
                  <input required value={courseFormData.category} onChange={e => setCourseFormData({...courseFormData, category: e.target.value})}
                    placeholder="Design / IT" className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-black text-slate-800 focus:ring-2 focus:ring-[#E5B54F]/20 focus:border-[#E5B54F] focus:bg-white outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Level Materi</label>
                  <select value={courseFormData.level} onChange={e => setCourseFormData({...courseFormData, level: e.target.value})}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-black text-slate-800 focus:ring-2 focus:ring-[#E5B54F]/20 focus:border-[#E5B54F] focus:bg-white outline-none transition-all appearance-none cursor-pointer">
                    <option value="BEGINNER">Pemula (Beginner)</option>
                    <option value="INTERMEDIATE">Menengah (Intermediate)</option>
                    <option value="ADVANCED">Mahir (Advanced)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Assign Pengajar</label>
                  <select required value={courseFormData.teacherId} onChange={e => setCourseFormData({...courseFormData, teacherId: e.target.value})}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-black text-slate-800 focus:ring-2 focus:ring-[#E5B54F]/20 focus:border-[#E5B54F] focus:bg-white outline-none transition-all appearance-none cursor-pointer">
                    <option value="">-- Pilih Pengajar --</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Harga Kursus</label>
                  <div className="relative">
                    <span className="absolute left-5 top-4 text-[#1A2E44] font-black text-sm">Rp</span>
                    <input type="number" required value={courseFormData.price} onChange={e => setCourseFormData({...courseFormData, price: Number(e.target.value)})}
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 pl-12 text-sm font-black text-slate-800 focus:ring-2 focus:ring-[#E5B54F]/20 focus:border-[#E5B54F] focus:bg-white outline-none transition-all" />
                  </div>
                </div>
                <div className="flex flex-col justify-end pb-1">
                  <label className="flex items-center gap-3 cursor-pointer group bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:bg-[#E5B54F]/5 transition-all">
                    <div className="relative">
                      <input type="checkbox" checked={courseFormData.isPremium} onChange={e => setCourseFormData({...courseFormData, isPremium: e.target.checked})} className="sr-only" />
                      <div className={`w-12 h-6 rounded-full transition-all duration-300 ${courseFormData.isPremium ? "bg-[#1A2E44]" : "bg-slate-200"}`}></div>
                      <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${courseFormData.isPremium ? "translate-x-6" : ""}`}></div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#1A2E44]">Konten Premium (Bursa)</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Deskripsi Singkat</label>
                <textarea required value={courseFormData.description} onChange={e => setCourseFormData({...courseFormData, description: e.target.value})} rows={4}
                  placeholder="Jelaskan poin-poin utama kursus ini..." className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-5 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-[#E5B54F]/20 focus:border-[#E5B54F] focus:bg-white outline-none transition-all resize-none"></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowCourseModal(false)} className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Batal</button>
                <button type="submit" disabled={savingCourse} className="flex-1 px-6 py-4 rounded-2xl bg-[#1A2E44] text-[10px] font-black uppercase tracking-[0.2em] text-[#E5B54F] shadow-lg shadow-[#1A2E44]/20 hover:scale-[1.02] transition-all disabled:opacity-50">
                  {savingCourse ? "Processing..." : (isEditingCourse ? "Update Data" : "Terbitkan")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Assignment Modal (PREMIUM TOGGLE STYLE) */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A2E44]/70 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-[40px] bg-white p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-200 border-4 border-[#E5B54F]/10">
            <h2 className="text-2xl font-black text-[#1A2E44] mb-2 tracking-tight">Tugaskan Pengajar</h2>
            <p className="text-[11px] font-bold text-slate-400 mb-8 uppercase tracking-widest">Kursus: <span className="text-[#8B0000]">{selectedCourseForTeacher?.title}</span></p>
            
            <div className="grid grid-cols-1 gap-3 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
              <button 
                onClick={() => assignTeacher(null)} 
                className={`group flex items-center gap-4 p-5 rounded-3xl transition-all text-left border-2 ${!selectedCourseForTeacher?.teacherId ? "bg-[#1A2E44] border-[#E5B54F] shadow-lg shadow-[#1A2E44]/20" : "bg-slate-50 border-transparent hover:border-slate-200 hover:bg-white"}`}
              >
                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center text-sm font-black shadow-inner transition-colors ${!selectedCourseForTeacher?.teacherId ? "bg-[#E5B54F] text-[#1A2E44]" : "bg-slate-200 text-slate-400"}`}>?</div>
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${!selectedCourseForTeacher?.teacherId ? "text-white" : "text-slate-400 italic"}`}>Tanpa Pengajar</p>
                  <p className={`text-[9px] font-bold ${!selectedCourseForTeacher?.teacherId ? "text-[#E5B54F]" : "text-slate-300"}`}>Kosongkan penugasan materi</p>
                </div>
              </button>
              
              {teachers.map(t => {
                const isSelected = selectedCourseForTeacher?.teacherId === t.id;
                return (
                  <button key={t.id} onClick={() => assignTeacher(t.id)} disabled={assigning}
                    className={`group flex items-center gap-4 p-5 rounded-3xl transition-all text-left border-2 ${isSelected ? "bg-[#1A2E44] border-[#E5B54F] shadow-lg shadow-[#1A2E44]/20" : "bg-slate-50 border-transparent hover:border-slate-200 hover:bg-white"}`}
                  >
                    <div className={`h-11 w-11 rounded-2xl flex items-center justify-center text-sm font-black shadow-md transition-colors ${isSelected ? "bg-[#E5B54F] text-[#1A2E44]" : "bg-[#1A2E44] text-[#E5B54F]"}`}>
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-black truncate transition-colors ${isSelected ? "text-white" : "text-slate-800"}`}>{t.name}</p>
                      <p className={`text-[9px] font-bold truncate transition-colors ${isSelected ? "text-[#E5B54F]" : "text-slate-400"}`}>{t.email}</p>
                    </div>
                    {isSelected && (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E5B54F] text-[#1A2E44] shadow-sm animate-in fade-in scale-in-0 duration-300">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-8">
              <button onClick={() => setShowTeacherModal(false)} className="w-full rounded-2xl bg-slate-50 border border-slate-100 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-100 transition-all">Tutup Jendela</button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Premium Modals & Toast */}
      <PremiumModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, courseId: "", status: null })}
        onConfirm={handleUpdateStatus}
        title="Validasi Akademik"
        message={`Apakah Anda yakin ingin mengubah status publikasi mata pelajaran ini menjadi "${statusModal.status}"?`}
        type="info"
        confirmText="Konfirmasi Perubahan"
        loading={updating}
      />

      <PremiumModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, courseId: "", title: "" })}
        onConfirm={handleDeleteCourse}
        title="Penghapusan Permanen"
        message={`Tindakan Berbahaya! Anda akan menghapus "${deleteModal.title}". Seluruh progres siswa dan materi di dalamnya akan hilang selamanya.`}
        type="delete"
        confirmText="Hapus Selamanya"
        loading={deleting}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </main>
  );
}
