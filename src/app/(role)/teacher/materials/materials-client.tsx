"use client";

import { useState, useEffect } from "react";

type Course = { id: string; title: string };
type Chapter = { id: string; title: string };
type Lesson = {
  id: string;
  title: string;
  description: string | null;
  orderNumber: number;
  type: string;
  attachmentUrl: string | null;
  videoUrl: string | null;
  createdAt: string;
};
type LessonsPerCourse = { courseId: string; courseTitle: string; lessons: Lesson[] };
type Props = { courses: Course[]; lessonsPerCourse: LessonsPerCourse[] };

export function MaterialsClient({ courses, lessonsPerCourse }: Props) {
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapterId, setActiveChapterId] = useState("");
  
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);

  // Fetch chapters when courseId changes
  useEffect(() => {
    if (!courseId) return;
    const fetchChapters = async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}/chapters`, { credentials: "include" });
        const data = await res.json();
        if (data.chapters) {
          setChapters(data.chapters);
          setActiveChapterId(data.chapters[0]?.id ?? "");
        }
      } catch (e) {
        console.error("Gagal mengambil bab", e);
      }
    };
    fetchChapters();
  }, [courseId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) setPreviewUrl(URL.createObjectURL(f));
    else setPreviewUrl(null);
  };

  const handleUpload = async () => {
    if (!title || !courseId || !activeChapterId) { 
      setMsg("Judul, kursus, dan bab wajib diisi."); 
      return; 
    }
    if (!file && !linkUrl) { 
      setMsg("Pilih file atau isi link materi."); 
      return; 
    }
    
    setLoading(true); 
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("title", title);
      if (desc) fd.append("description", desc);
      if (file) fd.append("attachment", file); // Backend expects 'attachment' or 'file' depending on route
      if (linkUrl) fd.append("videoUrl", linkUrl);
      
      const res = await fetch(`/api/chapters/${activeChapterId}/lessons`, { 
        method: "POST", 
        credentials: "include", 
        body: fd 
      });

      if (res.ok) { 
        setMsg("Berhasil diupload!"); 
        setTitle(""); 
        setDesc(""); 
        setFile(null); 
        setLinkUrl(""); 
        setPreviewUrl(null); 
        setTimeout(() => window.location.reload(), 800); 
      } else { 
        const e = await res.json(); 
        setMsg("Gagal: " + (e.message ?? "coba lagi")); 
      }
    } catch { 
      setMsg("Error sistem."); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus materi ini?")) return;
    const res = await fetch("/api/lessons/" + id, { method: "DELETE", credentials: "include" });
    if (res.ok) window.location.reload(); else alert("Gagal menghapus.");
  };

  const isVideo = (url: string) => /\.(mp4|webm|ogg|mov)$/i.test(url) || url.includes("youtube.com") || url.includes("youtu.be");
  const isPdf = (url: string) => /\.pdf$/i.test(url);

  return (
    <div className="space-y-8 pb-20">

      {/* Modal Preview */}
      {previewLesson && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setPreviewLesson(null)}>
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto p-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-800">{previewLesson.title}</h3>
                {previewLesson.description && <p className="text-sm text-slate-500 mt-2 leading-relaxed">{previewLesson.description}</p>}
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">Diupload: {new Date(previewLesson.createdAt).toLocaleString("id-ID")}</p>
              </div>
              <button onClick={() => setPreviewLesson(null)} className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all font-bold">x</button>
            </div>
            {(previewLesson.attachmentUrl || previewLesson.videoUrl) && (
              <div className="rounded-[24px] overflow-hidden border border-slate-100">
                {previewLesson.videoUrl && isVideo(previewLesson.videoUrl) && (
                  <div className="aspect-video">
                     <iframe src={previewLesson.videoUrl} className="w-full h-full" allowFullScreen />
                  </div>
                )}
                {previewLesson.attachmentUrl && isPdf(previewLesson.attachmentUrl) && (
                  <iframe src={previewLesson.attachmentUrl} className="w-full h-[60vh]" />
                )}
              </div>
            )}
            {!previewLesson.attachmentUrl && !previewLesson.videoUrl && (
              <div className="p-20 text-center bg-slate-50 rounded-[32px] text-slate-300 font-bold text-sm">Preview tidak tersedia.</div>
            )}
          </div>
        </div>
      )}

      {/* Form Upload */}
      <div className="p-10 bg-white rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex items-center gap-3 mb-2">
           <div className="h-8 w-1.5 bg-[#8B0000] rounded-full" />
           <h2 className="text-2xl font-black text-slate-800">Upload Materi / Rekaman</h2>
        </div>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-10">Unggah konten pembelajaran ke dalam kurikulum kelas.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Pilih Kelas <span className="text-red-500">*</span></label>
            <select 
              value={courseId} 
              onChange={(e) => setCourseId(e.target.value)} 
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#8B0000]/10 focus:border-[#8B0000] transition-all"
            >
              <option value="" disabled>Pilih Kursus</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Pilih Bab <span className="text-red-500">*</span></label>
            <select 
              value={activeChapterId} 
              onChange={(e) => setActiveChapterId(e.target.value)} 
              disabled={chapters.length === 0}
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#8B0000]/10 focus:border-[#8B0000] transition-all disabled:opacity-50"
            >
              {chapters.length === 0 ? (
                <option value="">Belum ada bab di kursus ini</option>
              ) : (
                chapters.map((ch) => <option key={ch.id} value={ch.id}>{ch.title}</option>)
              )}
            </select>
            {chapters.length === 0 && courseId && (
               <p className="text-[9px] text-red-400 mt-2 font-bold italic">* Silakan buat bab terlebih dahulu di menu Kurikulum Kursus.</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Judul Materi <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Contoh: Pertemuan 1 - Pengenalan Angka" 
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#8B0000]/10 focus:border-[#8B0000] transition-all" 
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Deskripsi Singkat</label>
            <textarea 
              value={desc} 
              onChange={(e) => setDesc(e.target.value)} 
              rows={2} 
              placeholder="Berikan gambaran singkat mengenai isi materi ini..." 
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#8B0000]/10 focus:border-[#8B0000] transition-all" 
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">File Materi (Video / PDF)</label>
            <div className="border-2 border-dashed border-slate-100 rounded-[32px] p-10 text-center hover:border-[#8B0000] hover:bg-red-50/20 transition-all group">
              <input type="file" id="file-upload" accept="video/*,application/pdf" onChange={handleFileChange} className="hidden" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="h-16 w-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                   <span className="text-3xl">📁</span>
                </div>
                <p className="text-sm font-black text-slate-800">Klik untuk pilih file</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Maksimal 25MB · MP4 atau PDF</p>
              </label>
              {file && (
                <div className="mt-6 p-4 rounded-2xl bg-white border border-slate-100 text-left flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-xs font-black text-slate-700">{file.name}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{(file.size/1024/1024).toFixed(2)} MB · {file.type}</p>
                  </div>
                  <button onClick={() => setFile(null)} className="text-[10px] font-black text-red-500 uppercase tracking-widest">Hapus</button>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Atau Link Video (YouTube/Vimeo)</label>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://www.youtube.com/embed/..."
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#8B0000]/10 focus:border-[#8B0000] transition-all"
            />
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-2 italic">* Gunakan Link Embed jika ingin bisa diputar langsung.</p>
          </div>
        </div>

        {msg && (
          <div className={`mt-8 p-4 rounded-2xl text-center text-xs font-black uppercase tracking-widest ${msg.includes("Berhasil") ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
            {msg}
          </div>
        )}

        <button 
          onClick={handleUpload} 
          disabled={loading || !activeChapterId} 
          className="mt-10 w-full flex items-center justify-center gap-3 bg-[#8B0000] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-red-900/20 hover:bg-red-800 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-40"
        >
          {loading ? "Sedang Mengupload..." : "Upload Materi"}
        </button>
      </div>

      {/* Daftar Materi Berdasarkan Kelas */}
      <div className="space-y-6">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Arsip Materi Terupload</p>
        {lessonsPerCourse.map((lpc) => (
          <div key={lpc.courseId} className="rounded-[40px] border border-slate-100 bg-white shadow-sm overflow-hidden transition-all hover:shadow-xl hover:shadow-slate-200/50">
            <div className="px-10 py-6 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-800">{lpc.courseTitle}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{lpc.lessons.length} Materi Tersimpan</p>
              </div>
            </div>
            {lpc.lessons.length === 0 ? (
              <div className="px-10 py-20 text-center text-[10px] text-slate-300 font-black uppercase tracking-widest">Belum ada materi untuk kelas ini.</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {lpc.lessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center gap-6 px-10 py-6 hover:bg-slate-50 transition-colors group">
                    <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 shadow-sm grid place-items-center shrink-0 font-black text-[#8B0000] group-hover:scale-110 transition-transform">
                      {lesson.orderNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-700 truncate">{lesson.title}</p>
                      {lesson.description && <p className="text-[11px] text-slate-400 truncate mt-1 leading-relaxed">{lesson.description}</p>}
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${lesson.attachmentUrl || lesson.videoUrl ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                          {lesson.attachmentUrl ? (lesson.type === "PDF" ? "PDF Material" : "Video File") : (lesson.videoUrl ? "Embed Link" : "No File")}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{new Date(lesson.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {(lesson.attachmentUrl || lesson.videoUrl) && (
                        <button onClick={() => setPreviewLesson(lesson)} className="px-4 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#8B0000] transition-colors shadow-lg shadow-slate-900/10">
                          Preview
                        </button>
                      )}
                      <button onClick={() => handleDelete(lesson.id)} className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">
                        <span className="text-sm">🗑️</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
