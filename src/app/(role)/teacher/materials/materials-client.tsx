"use client";

import { useState, useEffect } from "react";
import { Video, Upload, X, Calendar, Clock, Eye, Trash2 } from "lucide-react";

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
type Batch = { id: string; name: string; isActive: boolean; courseId: string };
type LessonsPerCourse = { courseId: string; courseTitle: string; lessons: Lesson[] };
type Props = { courses: Course[]; batches: Batch[]; lessonsPerCourse: LessonsPerCourse[] };

export function RecordingsClient({ courses, batches, lessonsPerCourse }: Props) {
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [batchId, setBatchId] = useState("");
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapterId, setActiveChapterId] = useState("");
  
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);

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
  };

  const handleUpload = async () => {
    if (!title || !courseId || !activeChapterId) { 
      setMsg("Judul, kursus, dan bab wajib diisi."); 
      return; 
    }
    if (!file && !linkUrl) { 
      setMsg("Pilih file rekaman atau isi link video."); 
      return; 
    }
    
    setLoading(true); 
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("title", title);
      if (batchId) fd.append("batchId", batchId);
      if (desc) fd.append("description", desc);
      if (file) fd.append("attachment", file);
      if (linkUrl) fd.append("videoUrl", linkUrl);
      
      const res = await fetch(`/api/chapters/${activeChapterId}/lessons`, { 
        method: "POST", 
        credentials: "include", 
        body: fd 
      });

      if (res.ok) { 
        setMsg("Rekaman berhasil diupload!"); 
        setTitle(""); setDesc(""); setFile(null); setLinkUrl(""); 
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
    if (!confirm("Hapus rekaman ini?")) return;
    const res = await fetch("/api/lessons/" + id, { method: "DELETE", credentials: "include" });
    if (res.ok) window.location.reload(); else alert("Gagal menghapus.");
  };

  const isVideo = (url: string) => /\.(mp4|webm|ogg|mov)$/i.test(url) || url.includes("youtube.com") || url.includes("youtu.be");

  const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-[#0B213F] placeholder:text-slate-300 focus:border-[#0B213F] focus:outline-none focus:ring-2 focus:ring-[#0B213F]/10 transition-all";
  const labelClass = "block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2";
  const selectClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-[#0B213F] focus:border-[#0B213F] focus:outline-none focus:ring-2 focus:ring-[#0B213F]/10 transition-all";

  return (
    <div className="space-y-8 pb-20">

      {/* Preview Modal */}
      {previewLesson && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setPreviewLesson(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-auto p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-[#0B213F]">{previewLesson.title}</h3>
                {previewLesson.description && <p className="text-sm text-slate-500 mt-1">{previewLesson.description}</p>}
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-3 flex items-center gap-1.5">
                  <Calendar size={11} /> {new Date(previewLesson.createdAt).toLocaleString("id-ID")}
                </p>
              </div>
              <button onClick={() => setPreviewLesson(null)} className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition">
                <X size={16} />
              </button>
            </div>
            {(previewLesson.videoUrl && isVideo(previewLesson.videoUrl)) && (
              <div className="rounded-xl overflow-hidden border border-slate-100 aspect-video">
                <iframe src={previewLesson.videoUrl} className="w-full h-full" allowFullScreen />
              </div>
            )}
            {(previewLesson.attachmentUrl && /\.pdf$/i.test(previewLesson.attachmentUrl)) && (
              <iframe src={previewLesson.attachmentUrl} className="w-full h-[60vh] rounded-xl border border-slate-100" />
            )}
            {!previewLesson.attachmentUrl && !previewLesson.videoUrl && (
              <div className="p-16 text-center bg-slate-50 rounded-xl text-slate-300 font-semibold text-sm">Preview tidak tersedia</div>
            )}
          </div>
        </div>
      )}

      {/* Upload Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-9 w-9 rounded-xl bg-[#0B213F] flex items-center justify-center text-[#D4AF37]">
            <Upload size={16} />
          </div>
          <h2 className="text-base font-black text-[#0B213F]">Upload Rekaman</h2>
        </div>
        <p className="text-[11px] text-slate-400 font-medium mb-8 ml-12">Upload rekaman pertemuan Zoom/Google Meet agar siswa bisa review ulang.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Pilih Kelas <span className="text-red-400">*</span></label>
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className={selectClass}>
              <option value="" disabled>Pilih Kursus</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Pilih Bab <span className="text-red-400">*</span></label>
            <select value={activeChapterId} onChange={(e) => setActiveChapterId(e.target.value)} disabled={chapters.length === 0} className={`${selectClass} disabled:opacity-50`}>
              {chapters.length === 0 ? (
                <option value="">Belum ada bab</option>
              ) : (
                chapters.map((ch) => <option key={ch.id} value={ch.id}>{ch.title}</option>)
              )}
            </select>
            {chapters.length === 0 && courseId && (
               <p className="text-[9px] text-amber-500 mt-1.5 font-semibold">Buat bab dulu di Kursus Saya → Atur Kurikulum</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Batch / Angkatan</label>
            <select value={batchId} onChange={(e) => setBatchId(e.target.value)} className={selectClass}>
              <option value="">Semua Siswa</option>
              {batches.filter(b => b.courseId === courseId).map((b) => (
                <option key={b.id} value={b.id}>{b.name} {!b.isActive ? "(Tidak Aktif)" : ""}</option>
              ))}
            </select>
            <p className="text-[9px] text-slate-400 mt-1.5 font-medium">Kosongkan agar semua siswa bisa akses</p>
          </div>

          <div>
            <label className={labelClass}>Judul Rekaman <span className="text-red-400">*</span></label>
            <input 
              type="text" value={title} onChange={(e) => setTitle(e.target.value)} 
              placeholder="Contoh: Pertemuan 3 - 17 Mei 2026" className={inputClass}
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Catatan Pertemuan</label>
            <textarea 
              value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} 
              placeholder="Ringkasan topik yang dibahas di pertemuan ini..." 
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>File Rekaman (Video)</label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-[#0B213F]/30 hover:bg-[#0B213F]/[0.01] transition-all group cursor-pointer"
              onClick={() => document.getElementById("recording-upload")?.click()}>
              <input type="file" id="recording-upload" accept="video/*,application/pdf" onChange={handleFileChange} className="hidden" />
              <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#0B213F]/5 transition">
                <Video size={20} className="text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-600">Klik untuk pilih file rekaman</p>
              <p className="text-[10px] text-slate-400 font-medium mt-1">MP4, WebM, atau PDF — Maks 100MB</p>
              {file && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0B213F]/5 border border-[#0B213F]/10">
                  <Video size={14} className="text-[#0B213F]" />
                  <span className="text-xs font-bold text-[#0B213F]">{file.name}</span>
                  <span className="text-[10px] text-slate-400">({(file.size/1024/1024).toFixed(1)} MB)</span>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-slate-400 hover:text-red-500 ml-1"><X size={13} /></button>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Atau Link Video (YouTube / Google Drive)</label>
            <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://www.youtube.com/embed/..." className={inputClass} />
            <p className="text-[9px] text-slate-400 mt-1.5 font-medium">Gunakan link embed agar bisa diputar langsung oleh siswa</p>
          </div>
        </div>

        {msg && (
          <div className={`mt-6 p-3 rounded-xl text-center text-xs font-bold ${msg.includes("berhasil") ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"}`}>
            {msg}
          </div>
        )}

        <button 
          onClick={handleUpload} disabled={loading || !activeChapterId} 
          className="mt-6 w-full flex items-center justify-center gap-2 bg-[#0B213F] text-white py-3.5 rounded-xl text-xs font-black hover:bg-[#0d2847] transition active:scale-[0.98] disabled:opacity-40"
        >
          <Upload size={15} />
          {loading ? "Mengupload..." : "Upload Rekaman"}
        </button>
      </div>

      {/* Recordings List */}
      <div className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Rekaman Tersimpan</p>
        {lessonsPerCourse.map((lpc) => (
          <div key={lpc.courseId} className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#0B213F]">{lpc.courseTitle}</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{lpc.lessons.length} rekaman</p>
              </div>
            </div>
            {lpc.lessons.length === 0 ? (
              <div className="px-6 py-12 text-center text-[11px] text-slate-300 font-medium">Belum ada rekaman untuk kelas ini</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {lpc.lessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition group">
                    <div className="h-10 w-10 rounded-xl bg-[#0B213F]/5 border border-slate-100 flex items-center justify-center shrink-0 text-[#0B213F] group-hover:bg-[#0B213F] group-hover:text-white transition">
                      <Video size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-700 truncate">{lesson.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${lesson.attachmentUrl || lesson.videoUrl ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                          {lesson.videoUrl ? "Video" : lesson.attachmentUrl ? "File" : "Tidak ada file"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                          <Calendar size={10} /> {new Date(lesson.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition">
                      {(lesson.attachmentUrl || lesson.videoUrl) && (
                        <button onClick={() => setPreviewLesson(lesson)} className="px-3 py-1.5 rounded-lg bg-[#0B213F] text-white text-[10px] font-bold hover:bg-[#0d2847] transition flex items-center gap-1">
                          <Eye size={12} /> Preview
                        </button>
                      )}
                      <button onClick={() => handleDelete(lesson.id)} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition">
                        <Trash2 size={14} />
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
