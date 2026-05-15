"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Calendar, Clock, Link2, Trash2, Edit3, Filter, ChevronRight, User, ExternalLink } from "lucide-react";
import { PremiumModal, Toast } from "@/shared/components/ui/PremiumFeedback";

interface Schedule {
  id: string;
  courseId: string;
  date: string;
  startTime: string;
  endTime: string;
  meetingLink: string | null;
  course: {
    title: string;
    teacher: { id: string, name: string } | null;
  };
}

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface Course {
  id: string;
  title: string;
  teachers?: { id: string, name: string }[];
}

export default function AdminSchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [formData, setFormData] = useState({
    id: "",
    courseId: "",
    date: new Date().toISOString().split('T')[0],
    startTime: "08:00",
    endTime: "09:00",
    meetingLink: ""
  });
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: "", title: "" });
  const [deleting, setDeleting] = useState(false);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [schRes, crsRes, tchrRes] = await Promise.all([
        fetch("/api/admin/schedules", { credentials: "include" }),
        fetch("/api/courses", { credentials: "include" }),
        fetch("/api/admin/users?role=TEACHER", { credentials: "include" })
      ]);
      if (schRes.ok) {
        const d = await schRes.json().catch(() => ({}));
        setSchedules(d.schedules || []);
      }
      if (crsRes.ok) {
        const d = await crsRes.json().catch(() => ({}));
        setAllCourses(d.courses || []);
      }
      if (tchrRes.ok) {
        const d = await tchrRes.json().catch(() => ({}));
        setTeachers(d.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseId) return showToast("Pilih kursus terlebih dahulu", "error");

    setSaving(true);
    try {
      const url = isEditing ? `/api/admin/schedules/${formData.id}` : "/api/admin/schedules";
      const method = isEditing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showToast(isEditing ? "Jadwal diperbarui" : "Jadwal berhasil dibuat");
        setShowModal(false);
        fetchData();
      } else {
        showToast("Gagal menyimpan jadwal", "error");
      }
    } catch (e) {
      showToast("Terjadi kesalahan", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/schedules/${deleteModal.id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Jadwal dihapus");
        setDeleteModal({ ...deleteModal, isOpen: false });
        fetchData();
      } else {
        showToast("Gagal menghapus", "error");
      }
    } catch (e) {
      showToast("Terjadi kesalahan", "error");
    } finally {
      setDeleting(false);
    }
  };

  const isExpired = (date: string, endTime: string) => {
    const end = new Date(date);
    const [hours, minutes] = endTime.split(':');
    end.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return new Date() > end;
  };

  const filteredSchedules = schedules.filter(s => {
    const matchesSearch = s.course.title.toLowerCase().includes(search.toLowerCase()) ||
      (s.course.teacher?.name?.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
  });

  const availableCourses = allCourses.filter(c => c.teachers?.some(t => t.id === selectedTeacherId));

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-500">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <PremiumModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDelete}
        title="Hapus Jadwal"
        message={`Yakin ingin menghapus jadwal untuk ${deleteModal.title}?`}
        type="delete"
        loading={deleting}
      />

      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block h-1.5 w-8 rounded-full bg-[#1A2E44]" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#1A2E44]">Academic Planning</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl uppercase">
              Manajemen <span className="text-[#8B0000]">Jadwal</span>
            </h1>
          </div>
          <button
            onClick={() => {
              setIsEditing(false);
              setSelectedTeacherId("");
              setFormData({ id: "", courseId: "", date: new Date().toISOString().split('T')[0], startTime: "08:00", endTime: "09:00", meetingLink: "" });
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-[#1A2E44] text-white px-8 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-[#8B0000] hover:scale-105 transition-all shadow-xl shadow-slate-900/10 active:scale-95"
          >
            <Plus size={18} strokeWidth={3} /> Tambah Jadwal
          </button>
        </header>

        {/* Search */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#8B0000] transition-colors" size={20} />
            <input
              type="text"
              placeholder="Cari kursus atau guru..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-5 rounded-[28px] border border-slate-100 bg-white shadow-sm focus:outline-none focus:ring-4 focus:ring-[#8B0000]/5 transition-all font-medium"
            />
          </div>
        </div>

        {/* Schedule List */}
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 w-full bg-slate-100 animate-pulse rounded-[32px]" />)}
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="rounded-[40px] border-2 border-dashed border-slate-100 bg-slate-50/50 p-20 text-center">
            <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Calendar size={32} className="text-slate-200" />
            </div>
            <p className="text-lg font-black text-slate-300 uppercase tracking-widest">Jadwal tidak ditemukan</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredSchedules.map((s) => {
              const expired = isExpired(s.date, s.endTime);
              return (
                <div key={s.id} className={`group flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 ${expired ? "opacity-60 grayscale" : "hover:border-[#8B0000]/20"}`}>
                  <div className="flex items-center gap-6">
                    <div className={`h-16 w-16 shrink-0 rounded-3xl flex flex-col items-center justify-center transition-all duration-500 ${expired ? "bg-slate-100 text-slate-400" : "bg-[#8B0000]/5 text-[#8B0000] group-hover:bg-[#8B0000] group-hover:text-white"}`}>
                      <Calendar size={20} strokeWidth={3} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-[#1A2E44] uppercase tracking-tight group-hover:text-[#8B0000] transition-colors">{s.course.title}</h3>
                        {expired && <span className="text-[9px] font-black bg-slate-100 text-slate-400 px-3 py-1 rounded-full uppercase tracking-widest">Expired</span>}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                          <User size={14} className="text-[#E5B54F]" /> {s.course.teacher?.name || "No Teacher"}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                          <Calendar size={14} className="text-[#E5B54F]" /> {new Date(s.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                          <Clock size={14} className="text-[#E5B54F]" /> {s.startTime} - {s.endTime}
                        </div>
                        {s.meetingLink && (
                          <a
                            href={expired ? "#" : s.meetingLink}
                            target={expired ? "_self" : "_blank"}
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 text-[10px] font-black px-3 py-1.5 rounded-full transition-all ${expired ? "bg-slate-100 text-slate-300 cursor-not-allowed" : "bg-red-50 text-[#8B0000] hover:bg-[#8B0000] hover:text-white"}`}
                          >
                            <Link2 size={12} /> {expired ? "Link Kadaluarsa" : "Buka Link Meeting"}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setSelectedTeacherId(s.course.teacher?.id || "");
                        setFormData({ ...s, date: s.date.split('T')[0], meetingLink: s.meetingLink || "" });
                        setShowModal(true);
                      }}
                      className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-[#1A2E44] hover:text-white flex items-center justify-center transition-all active:scale-90"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteModal({ isOpen: true, id: s.id, title: s.course.title })}
                      className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all active:scale-90"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#1A2E44]/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-[#8B0000] p-8 text-white">
              <h3 className="text-2xl font-black uppercase tracking-tighter">{isEditing ? "Edit Jadwal" : "Tambah Jadwal Baru"}</h3>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Lengkapi detail sesi belajar di bawah ini.</p>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">1. Pilih Akun Guru</label>
                  <select
                    required
                    disabled={isEditing}
                    value={selectedTeacherId}
                    onChange={(e) => {
                      setSelectedTeacherId(e.target.value);
                      setFormData({ ...formData, courseId: "" });
                    }}
                    className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-[#8B0000]/5 font-bold text-sm uppercase appearance-none disabled:opacity-50"
                  >
                    <option value="">-- Pilih Guru --</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.email})</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">2. Pilih Kursus</label>
                  <select
                    required
                    disabled={isEditing || !selectedTeacherId}
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-[#8B0000]/5 font-bold text-sm uppercase appearance-none disabled:opacity-50"
                  >
                    <option value="">-- Pilih Kursus --</option>
                    {availableCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-[#8B0000]/5 font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Link Zoom/GMeet</label>
                  <input
                    type="url"
                    placeholder="https://zoom.us/j/..."
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-[#8B0000]/5 font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Jam Mulai</label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-[#8B0000]/5 font-bold text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Jam Selesai</label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-[#8B0000]/5 font-bold text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 rounded-2xl border border-slate-100 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-4 rounded-2xl bg-[#8B0000] text-white font-black text-xs uppercase tracking-widest hover:bg-[#1A2E44] transition-all shadow-xl shadow-red-900/10 disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan Jadwal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        input[type="time"]::-webkit-calendar-picker-indicator,
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(15%) sepia(95%) saturate(3932%) hue-rotate(346deg) brightness(91%) contrast(101%);
        }
      `}</style>
    </div>
  );
}
