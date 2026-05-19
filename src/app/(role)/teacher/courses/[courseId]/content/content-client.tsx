"use client";

import { useState } from "react";
import { Plus, Trash2, Edit3, Video, FileText, ChevronDown, ChevronUp, Play, Save, X } from "lucide-react";
import { Toast } from "@/shared/components/ui/PremiumFeedback";

type Lesson = {
  id: string;
  chapterId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  orderNumber: number;
  type: string;
  videoUrl: string | null;
  attachmentUrl: string | null;
  durationInSeconds: number | null;
  isPreview: boolean;
  status: string;
};

type Chapter = {
  id: string;
  title: string;
  orderNumber: number;
  lessons: Lesson[];
};

type Props = {
  courseId: string;
  initialChapters: Chapter[];
};

export function ContentClient({ courseId, initialChapters }: Props) {
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [chapterTitle, setChapterTitle] = useState("");

  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  
  const [lessonData, setLessonData] = useState({
    title: "",
    description: "",
    type: "VIDEO",
    videoUrl: "",
    isPreview: false,
    duration: "",
  });
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>(
    initialChapters.reduce((acc, c) => ({ ...acc, [c.id]: true }), {})
  );

  const toggleChapter = (id: string) => {
    setExpandedChapters(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- Shared styles ---
  const inputClass = "w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-[#0B213F] placeholder:text-slate-300 focus:border-[#0B213F] focus:ring-2 focus:ring-[#0B213F]/10 outline-none transition-all";
  const labelClass = "block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2";

  // --- CHAPTER ACTIONS ---
  const handleSaveChapter = async () => {
    if (!chapterTitle) return;
    setLoading(true);
    try {
      const url = editingChapter ? `/api/chapters/${editingChapter.id}` : `/api/courses/${courseId}/chapters`;
      const method = editingChapter ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: chapterTitle }),
      });
      if (res.ok) {
        showToast(editingChapter ? "Bab diperbarui" : "Bab ditambahkan");
        window.location.reload();
      } else {
        showToast("Gagal menyimpan bab", "error");
      }
    } catch (e) {
      showToast("Terjadi kesalahan", "error");
    } finally {
      setLoading(false);
      setShowChapterModal(false);
      setEditingChapter(null);
      setChapterTitle("");
    }
  };

  const handleDeleteChapter = async (id: string) => {
    if (!confirm("Hapus bab ini dan semua materinya?")) return;
    try {
      const res = await fetch(`/api/chapters/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Bab dihapus");
        window.location.reload();
      }
    } catch (e) {
      showToast("Gagal menghapus", "error");
    }
  };

  // --- LESSON ACTIONS ---
  const handleSaveLesson = async () => {
    if (!lessonData.title) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", lessonData.title);
      fd.append("description", lessonData.description);
      fd.append("type", lessonData.type);
      fd.append("videoUrl", lessonData.videoUrl);
      fd.append("isPreview", String(lessonData.isPreview));
      if (lessonData.duration) fd.append("durationInSeconds", String(lessonData.duration));
      if (thumbnailFile) fd.append("thumbnail", thumbnailFile);
      if (attachmentFile) fd.append("attachment", attachmentFile);

      const url = editingLesson ? `/api/lessons/${editingLesson.id}` : `/api/chapters/${activeChapterId}/lessons`;
      const method = editingLesson ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        body: fd,
      });

      if (res.ok) {
        showToast(editingLesson ? "Materi diperbarui" : "Materi ditambahkan");
        window.location.reload();
      } else {
        const d = await res.json();
        showToast(d.message || "Gagal menyimpan materi", "error");
      }
    } catch (e) {
      showToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setLoading(false);
      setShowLessonModal(false);
      setEditingLesson(null);
      setLessonData({ title: "", description: "", type: "VIDEO", videoUrl: "", isPreview: false, duration: "" });
      setThumbnailFile(null);
      setAttachmentFile(null);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm("Hapus materi ini?")) return;
    try {
      const res = await fetch(`/api/lessons/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Materi dihapus");
        window.location.reload();
      }
    } catch (e) {
      showToast("Gagal menghapus", "error");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <section>
        <div className="flex items-center justify-between mb-5">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Kurikulum & Silabus</p>
          <button 
            onClick={() => { setEditingChapter(null); setChapterTitle(""); setShowChapterModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B213F] text-white text-[10px] font-black hover:bg-[#0d2847] transition shadow-sm"
          >
            <Plus size={14} />
            Tambah Bab
          </button>
        </div>

        <div className="space-y-3">
          {chapters.length === 0 && (
             <div className="p-16 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                <p className="text-slate-400 font-semibold text-sm">Belum ada kurikulum</p>
                <p className="text-slate-300 text-xs mt-1">Mulai dengan menambahkan bab pertama</p>
             </div>
          )}

          {chapters.map((chapter) => (
            <div key={chapter.id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
              {/* Chapter Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-b border-slate-100">
                <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleChapter(chapter.id)}>
                   <div className="h-9 w-9 rounded-xl bg-[#0B213F] flex items-center justify-center text-white text-xs font-black shrink-0">
                      {chapter.orderNumber}
                   </div>
                   <div className="min-w-0">
                      <h3 className="text-sm font-black text-[#0B213F] truncate">{chapter.title}</h3>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{chapter.lessons.length} materi</p>
                   </div>
                   {expandedChapters[chapter.id] ? <ChevronUp size={16} className="text-slate-300" /> : <ChevronDown size={16} className="text-slate-300" />}
                </div>
                
                <div className="flex items-center gap-1 ml-3">
                   <button 
                    onClick={() => { setEditingChapter(chapter); setChapterTitle(chapter.title); setShowChapterModal(true); }}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#0B213F] transition"
                   >
                      <Edit3 size={14} />
                   </button>
                   <button 
                    onClick={() => handleDeleteChapter(chapter.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition"
                   >
                      <Trash2 size={14} />
                   </button>
                </div>
              </div>

              {/* Lesson List */}
              {expandedChapters[chapter.id] && (
                <div className="p-3 space-y-1.5">
                  {chapter.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition group">
                       <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#0B213F] transition shrink-0">
                          {lesson.type === 'VIDEO' ? <Video size={16} /> : <FileText size={16} />}
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-700 truncate">{lesson.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                             <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${lesson.isPreview ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'bg-slate-100 text-slate-400'}`}>
                                {lesson.isPreview ? 'Preview' : 'Terkunci'}
                             </span>
                             {lesson.durationInSeconds && (
                                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                   <Play size={9} /> {(lesson.durationInSeconds / 60).toFixed(0)} min
                                </span>
                             )}
                          </div>
                       </div>
                       <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button 
                            onClick={() => {
                              setEditingLesson(lesson);
                              setLessonData({
                                title: lesson.title,
                                description: lesson.description || "",
                                type: lesson.type,
                                videoUrl: lesson.videoUrl || "",
                                isPreview: lesson.isPreview,
                                duration: lesson.durationInSeconds?.toString() || "",
                              });
                              setActiveChapterId(chapter.id);
                              setShowLessonModal(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition"
                          >
                             <Edit3 size={13} />
                          </button>
                          <button 
                            onClick={() => handleDeleteLesson(lesson.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition"
                          >
                             <Trash2 size={13} />
                          </button>
                       </div>
                    </div>
                  ))}

                  <button 
                    onClick={() => {
                      setEditingLesson(null);
                      setLessonData({ title: "", description: "", type: "VIDEO", videoUrl: "", isPreview: false, duration: "" });
                      setActiveChapterId(chapter.id);
                      setShowLessonModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-200 text-slate-400 hover:border-[#0B213F]/30 hover:text-[#0B213F] hover:bg-[#0B213F]/[0.02] transition text-[10px] font-bold"
                  >
                    <Plus size={13} />
                    Tambah Materi
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Chapter Modal ═══ */}
      {showChapterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
           <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-[#0B213F]">{editingChapter ? 'Edit Bab' : 'Bab Baru'}</h3>
                <button onClick={() => setShowChapterModal(false)} className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition">
                  <X size={15} />
                </button>
              </div>
              
              <div>
                 <label className={labelClass}>Judul Bab</label>
                 <input 
                   type="text" value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)}
                   placeholder="Contoh: Pengenalan Huruf Hijaiyah"
                   className={inputClass}
                 />
              </div>

              <div className="flex gap-3 mt-8">
                 <button onClick={() => setShowChapterModal(false)} className="flex-1 py-3.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-black hover:bg-slate-200 transition">Batal</button>
                 <button onClick={handleSaveChapter} disabled={loading} className="flex-1 py-3.5 rounded-xl bg-[#0B213F] text-white text-xs font-black hover:bg-[#0d2847] transition disabled:opacity-50">
                    {loading ? 'Menyimpan...' : 'Simpan Bab'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* ═══ Lesson Modal ═══ */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
           <div className="w-full max-w-2xl bg-white rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-[#0B213F]">{editingLesson ? 'Edit Materi' : 'Tambah Materi'}</h3>
                <button onClick={() => setShowLessonModal(false)} className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition">
                  <X size={15} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <div className="md:col-span-2">
                    <label className={labelClass}>Judul Materi</label>
                    <input 
                      type="text" value={lessonData.title} onChange={(e) => setLessonData({...lessonData, title: e.target.value})}
                      placeholder="Contoh: Pengenalan Angka 1-10"
                      className={inputClass}
                    />
                 </div>

                 <div className="md:col-span-2">
                    <label className={labelClass}>Tipe Konten</label>
                    <div className="flex gap-2">
                       {['VIDEO', 'PDF', 'LINK'].map((t) => (
                          <button 
                            key={t}
                            onClick={() => setLessonData({...lessonData, type: t})}
                            className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all ${
                              lessonData.type === t 
                                ? 'border-[#0B213F] bg-[#0B213F]/5 text-[#0B213F]' 
                                : 'border-slate-200 text-slate-400 hover:border-slate-300'
                            }`}
                          >
                             {t}
                          </button>
                       ))}
                    </div>
                 </div>

                 {lessonData.type === 'VIDEO' && (
                    <div className="md:col-span-2">
                       <label className={labelClass}>Video Embed URL</label>
                       <div className="relative">
                          <input 
                            type="text" value={lessonData.videoUrl} onChange={(e) => setLessonData({...lessonData, videoUrl: e.target.value})}
                            placeholder="https://www.youtube.com/embed/..."
                            className={`${inputClass} pl-10`}
                          />
                          <Video size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
                       </div>
                       <p className="text-[9px] text-slate-400 mt-1.5 font-medium">Gunakan link embed dari YouTube/Vimeo</p>
                    </div>
                 )}

                 <div>
                    <label className={labelClass}>Durasi (Detik)</label>
                    <input 
                      type="number" value={lessonData.duration} onChange={(e) => setLessonData({...lessonData, duration: e.target.value})}
                      placeholder="600"
                      className={inputClass}
                    />
                 </div>

                 <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <input 
                      type="checkbox" id="isPreview" checked={lessonData.isPreview}
                      onChange={(e) => setLessonData({...lessonData, isPreview: e.target.checked})}
                      className="h-4 w-4 accent-[#D4AF37] rounded"
                    />
                    <label htmlFor="isPreview" className="text-xs font-bold text-slate-600 cursor-pointer">Preview Gratis</label>
                 </div>

                 <div className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div>
                       <label className={labelClass}>Thumbnail</label>
                       <input 
                        type="file" accept="image/*"
                        onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                        className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-slate-100 file:text-slate-600 hover:file:bg-slate-200 cursor-pointer"
                       />
                    </div>
                    <div>
                       <label className={labelClass}>File Pendukung (PDF)</label>
                       <input 
                        type="file" accept=".pdf"
                        onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                        className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-slate-100 file:text-slate-600 hover:file:bg-slate-200 cursor-pointer"
                       />
                    </div>
                 </div>

                 <div className="md:col-span-2">
                    <label className={labelClass}>Deskripsi</label>
                    <textarea 
                      value={lessonData.description} onChange={(e) => setLessonData({...lessonData, description: e.target.value})}
                      rows={2} placeholder="Deskripsi singkat materi ini..."
                      className={`${inputClass} resize-none`}
                    />
                 </div>
              </div>

              <div className="flex gap-3 mt-8">
                 <button onClick={() => setShowLessonModal(false)} className="flex-1 py-3.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-black hover:bg-slate-200 transition">Batal</button>
                 <button onClick={handleSaveLesson} disabled={loading} className="flex-1 py-3.5 rounded-xl bg-[#0B213F] text-white text-xs font-black hover:bg-[#0d2847] transition disabled:opacity-50">
                    {loading ? 'Menyimpan...' : 'Simpan Materi'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
