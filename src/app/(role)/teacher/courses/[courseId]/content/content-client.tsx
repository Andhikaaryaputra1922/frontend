"use client";

import { useState } from "react";
import { Plus, Trash2, Edit3, Video, FileText, ChevronDown, ChevronUp, Play, Image as ImageIcon, ExternalLink, Save, X } from "lucide-react";
import { Toast, PremiumModal } from "@/shared/components/ui/PremiumFeedback";

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
  
  // Chapter State
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [chapterTitle, setChapterTitle] = useState("");

  // Lesson State
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
        window.location.reload(); // Simple sync
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
    <div className="space-y-8 pb-20">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <section>
        <div className="flex items-center justify-between mb-6">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Kurikulum & Silabus</p>
          <button 
            onClick={() => { setEditingChapter(null); setChapterTitle(""); setShowChapterModal(true); }}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#8B0000] text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-800 transition-all shadow-lg shadow-red-900/10"
          >
            <Plus size={16} />
            Tambah Bab Baru
          </button>
        </div>

        <div className="space-y-4">
          {chapters.length === 0 && (
             <div className="p-20 text-center border-2 border-dashed border-slate-100 rounded-[40px] bg-slate-50/30">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Belum ada kurikulum disusun.</p>
                <p className="text-slate-300 text-[10px] mt-2">Mulai dengan menambahkan Bab pertama Anda.</p>
             </div>
          )}

          {chapters.map((chapter) => (
            <div key={chapter.id} className="group rounded-[40px] border border-slate-100 bg-white shadow-sm overflow-hidden transition-all hover:shadow-xl hover:shadow-slate-200/50">
              {/* Chapter Header */}
              <div className="flex items-center justify-between px-8 py-6 bg-slate-50/50 border-b border-slate-50">
                <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => toggleChapter(chapter.id)}>
                   <div className="h-10 w-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black text-[#8B0000] shadow-sm">
                      {chapter.orderNumber}
                   </div>
                   <div className="min-w-0">
                      <h3 className="text-base font-black text-slate-800 truncate">{chapter.title}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{chapter.lessons.length} Materi</p>
                   </div>
                   {expandedChapters[chapter.id] ? <ChevronUp size={18} className="text-slate-300" /> : <ChevronDown size={18} className="text-slate-300" />}
                </div>
                
                <div className="flex items-center gap-2">
                   <button 
                    onClick={() => { setEditingChapter(chapter); setChapterTitle(chapter.title); setShowChapterModal(true); }}
                    className="p-3 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
                   >
                      <Edit3 size={16} />
                   </button>
                   <button 
                    onClick={() => handleDeleteChapter(chapter.id)}
                    className="p-3 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                   >
                      <Trash2 size={16} />
                   </button>
                </div>
              </div>

              {/* Lesson List */}
              {expandedChapters[chapter.id] && (
                <div className="p-4 space-y-2">
                  {chapter.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50/30 border border-transparent hover:border-slate-100 hover:bg-white transition-all group/lesson">
                       <div className="h-10 w-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover/lesson:text-[#8B0000] transition-colors">
                          {lesson.type === 'VIDEO' ? <Video size={18} /> : <FileText size={18} />}
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-700 truncate">{lesson.title}</p>
                          <div className="flex items-center gap-3 mt-1">
                             <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${lesson.isPreview ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                                {lesson.isPreview ? 'Preview Access' : 'Locked Content'}
                             </span>
                             {lesson.durationInSeconds && (
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                   <Play size={10} /> {(lesson.durationInSeconds / 60).toFixed(0)} Min
                                </span>
                             )}
                          </div>
                       </div>
                       <div className="flex items-center gap-1 opacity-0 group-hover/lesson:opacity-100 transition-all">
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
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-all"
                          >
                             <Edit3 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteLesson(lesson.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                          >
                             <Trash2 size={14} />
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
                    className="w-full flex items-center justify-center gap-2 p-4 rounded-3xl border-2 border-dashed border-slate-100 text-slate-400 hover:border-[#8B0000] hover:text-[#8B0000] hover:bg-red-50/30 transition-all text-[10px] font-black uppercase tracking-widest"
                  >
                    <Plus size={14} />
                    Tambah Materi Di Bab Ini
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* --- MODALS --- */}

      {/* Chapter Modal */}
      {showChapterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="w-full max-w-md bg-white rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
              <h3 className="text-2xl font-black text-slate-800 mb-2">{editingChapter ? 'Edit Bab' : 'Bab Baru'}</h3>
              <p className="text-xs text-slate-400 mb-8 font-bold uppercase tracking-widest">Tentukan judul untuk pengelompokan materi.</p>
              
              <div className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Judul Bab</label>
                    <input 
                      type="text" 
                      value={chapterTitle}
                      onChange={(e) => setChapterTitle(e.target.value)}
                      placeholder="Contoh: Dasar-Dasar Matematika"
                      className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-[#8B0000] focus:ring-2 focus:ring-red-900/5 transition-all text-sm font-bold outline-none"
                    />
                 </div>
              </div>

              <div className="flex gap-3 mt-10">
                 <button onClick={() => setShowChapterModal(false)} className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Batal</button>
                 <button onClick={handleSaveChapter} disabled={loading} className="flex-1 py-4 rounded-2xl bg-[#8B0000] text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-800 transition-all shadow-lg shadow-red-900/10">
                    {loading ? 'Menyimpan...' : 'Simpan Bab'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="w-full max-w-2xl bg-white rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <h3 className="text-2xl font-black text-slate-800 mb-2">{editingLesson ? 'Edit Materi' : 'Tambah Materi'}</h3>
              <p className="text-xs text-slate-400 mb-8 font-bold uppercase tracking-widest">Isi detail konten pembelajaran di bawah ini.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Judul Materi</label>
                    <input 
                      type="text" 
                      value={lessonData.title}
                      onChange={(e) => setLessonData({...lessonData, title: e.target.value})}
                      placeholder="Contoh: Pertemuan 1 - Pengenalan Angka"
                      className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-[#8B0000] focus:ring-2 focus:ring-red-900/5 transition-all text-sm font-bold outline-none"
                    />
                 </div>

                 <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Tipe Konten</label>
                    <div className="flex gap-2">
                       {['VIDEO', 'PDF', 'LINK'].map((t) => (
                          <button 
                            key={t}
                            onClick={() => setLessonData({...lessonData, type: t})}
                            className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${lessonData.type === t ? 'border-[#8B0000] bg-red-50 text-[#8B0000]' : 'border-slate-100 text-slate-400 hover:border-slate-300'}`}
                          >
                             {t}
                          </button>
                       ))}
                    </div>
                 </div>

                 {lessonData.type === 'VIDEO' && (
                    <div className="md:col-span-2">
                       <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Video Embed URL (YouTube/Vimeo)</label>
                       <div className="relative">
                          <input 
                            type="text" 
                            value={lessonData.videoUrl}
                            onChange={(e) => setLessonData({...lessonData, videoUrl: e.target.value})}
                            placeholder="https://www.youtube.com/embed/..."
                            className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-[#8B0000] transition-all text-sm font-bold outline-none pl-12"
                          />
                          <Video size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                       </div>
                       <p className="text-[9px] text-slate-400 mt-2 italic">* Gunakan link embed (misal dari tombol share &rarr; embed).</p>
                    </div>
                 )}

                 <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Durasi (Detik)</label>
                    <input 
                      type="number" 
                      value={lessonData.duration}
                      onChange={(e) => setLessonData({...lessonData, duration: e.target.value})}
                      placeholder="Contoh: 600"
                      className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white transition-all text-sm font-bold outline-none"
                    />
                 </div>

                 <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <input 
                      type="checkbox" 
                      id="isPreview"
                      checked={lessonData.isPreview}
                      onChange={(e) => setLessonData({...lessonData, isPreview: e.target.checked})}
                      className="h-5 w-5 accent-[#8B0000] rounded"
                    />
                    <label htmlFor="isPreview" className="text-[10px] font-black uppercase tracking-widest text-slate-700 cursor-pointer">Jadikan Preview Gratis</label>
                 </div>

                 <div className="md:col-span-2 space-y-4">
                    <div className="flex flex-col gap-4">
                       <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Thumbnail / Cover</label>
                       <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                        className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-slate-100 file:text-slate-600 hover:file:bg-slate-200 cursor-pointer"
                       />
                    </div>
                    <div className="flex flex-col gap-4">
                       <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">File Pendukung (PDF)</label>
                       <input 
                        type="file" 
                        accept=".pdf"
                        onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                        className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-slate-100 file:text-slate-600 hover:file:bg-slate-200 cursor-pointer"
                       />
                    </div>
                 </div>
              </div>

              <div className="flex gap-3 mt-10">
                 <button onClick={() => setShowLessonModal(false)} className="flex-1 py-4 rounded-2xl bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Batal</button>
                 <button onClick={handleSaveLesson} disabled={loading} className="flex-1 py-4 rounded-2xl bg-[#8B0000] text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-800 transition-all shadow-lg shadow-red-900/10">
                    {loading ? 'Menyimpan...' : 'Simpan Materi'}
                 </button>
              </div>
           </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}
