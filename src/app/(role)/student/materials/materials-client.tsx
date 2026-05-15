"use client";

import { useState } from "react";

type Lesson = {
  id: string;
  title: string;
  description: string | null;
  orderNumber: number;
  type: string;
  contentUrl: string | null;
  youtubeUrl: string | null;
  isDownloadable: boolean;
  createdAt: string;
  courseId: string;
  isLocked: boolean;
};

type Chapter = {
  id: string;
  title: string;
  description: string | null;
  orderNumber: number;
  lessons: Lesson[];
};

type CourseWithChapters = {
  id: string;
  title: string;
  chapters: Chapter[];
  lessonLimit: number | null;
};

type Props = {
  courses: CourseWithChapters[];
};

export function StudentMaterialsClient({ courses }: Props) {
  const [activeCourseId, setActiveCourseId] = useState<string | null>(courses[0]?.id || null);
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);

  const activeCourse = courses.find(c => c.id === activeCourseId);

  const isVideo = (url: string) => /\.(mp4|webm|ogg|mov)$/i.test(url);
  const isPdf = (url: string) => /\.pdf$/i.test(url);
  const isYoutube = (url: string) => /youtube\.com|youtu\.be/i.test(url);

  const getYoutubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const totalMateri = courses.reduce((acc, c) => acc + c.chapters.reduce((acc2, ch) => acc2 + ch.lessons.length, 0), 0);

  return (
    <div className="space-y-8">
      {/* Modal Preview */}
      {previewLesson && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setPreviewLesson(null)}>
          <div className="bg-[var(--surface)] rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-[var(--border)]" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-[var(--border)] flex items-start justify-between bg-[var(--base)]/50">
              <div>
                <h3 className="text-xl font-black text-[var(--text)] tracking-tight uppercase">{previewLesson.title}</h3>
                {previewLesson.description && <p className="text-sm text-[var(--muted)] mt-1 font-medium">{previewLesson.description}</p>}
              </div>
              <button onClick={() => setPreviewLesson(null)} className="h-10 w-10 rounded-full bg-black/5 flex items-center justify-center text-[var(--muted)] hover:bg-black/10 hover:text-[var(--text)] transition-all">×</button>
            </div>
            <div className="flex-1 overflow-auto p-2">
              {previewLesson.youtubeUrl && isYoutube(previewLesson.youtubeUrl) && (
                <iframe src={getYoutubeEmbedUrl(previewLesson.youtubeUrl)} className="w-full aspect-video rounded-2xl shadow-lg" allowFullScreen />
              )}
              {previewLesson.contentUrl && isVideo(previewLesson.contentUrl) && (
                <video controls className="w-full rounded-2xl shadow-lg" src={previewLesson.contentUrl} />
              )}
              {previewLesson.contentUrl && isPdf(previewLesson.contentUrl) && (
                <iframe src={previewLesson.contentUrl} className="w-full h-[70vh] rounded-2xl border border-[var(--border)]" />
              )}
            </div>
            {previewLesson.isDownloadable && previewLesson.contentUrl && (
              <div className="p-6 border-t border-[var(--border)] bg-[var(--base)]/50">
                <a href={previewLesson.contentUrl} download
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-[var(--primary)] text-[var(--primary-ink)] text-sm font-black uppercase tracking-widest hover:opacity-90 shadow-xl shadow-[var(--primary)]/20 transition-all">
                  Download Materi
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {totalMateri === 0 ? (
        <div className="rounded-[32px] border-2 border-dashed border-[var(--border)] bg-[var(--surface)] p-20 text-center">
          <div className="text-6xl mb-6">📚</div>
          <h3 className="text-2xl font-black text-[var(--text)] uppercase tracking-tight">Belum Ada Materi</h3>
          <p className="text-sm text-[var(--muted)] mt-2 max-w-md mx-auto font-medium">Pengajar sedang menyiapkan materi terbaik untukmu. Silakan cek kembali nanti atau hubungi admin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar Kursus */}
          <div className="lg:col-span-3 space-y-3">
             <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.2em] px-2 mb-4">Pilih Kursus</p>
             {courses.map(course => (
               <button
                 key={course.id}
                 onClick={() => { setActiveCourseId(course.id); setExpandedChapterId(null); }}
                 className={`w-full text-left px-5 py-4 rounded-[20px] transition-all duration-300 flex items-center justify-between group ${activeCourseId === course.id ? "bg-[var(--primary)] text-[var(--primary-ink)] shadow-lg shadow-[var(--primary)]/20 translate-x-2" : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] hover:border-[var(--primary)]/50"}`}
               >
                 <span className="text-[11px] font-black uppercase tracking-tight line-clamp-1">{course.title}</span>
                 <div className={`h-2 w-2 rounded-full transition-all ${activeCourseId === course.id ? "bg-white" : "bg-[var(--border)] group-hover:bg-[var(--primary)]"}`} />
               </button>
             ))}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            {activeCourse && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Header Kursus */}
                <div className="bg-[var(--surface)] rounded-[32px] p-8 border border-[var(--border)] shadow-sm relative overflow-hidden">
                   <div className="absolute -right-20 -top-20 h-64 w-64 bg-[var(--primary)]/5 rounded-full blur-3xl" />
                   <h2 className="text-3xl font-black text-[var(--text)] uppercase tracking-tighter relative z-10 leading-tight">{activeCourse.title}</h2>
                   <div className="flex items-center gap-4 mt-4 relative z-10">
                      <div className="flex items-center gap-2 px-3 py-1 bg-[var(--base)] rounded-full border border-[var(--border)]">
                         <span className="text-[10px] font-black text-[var(--primary)] uppercase">{activeCourse.chapters.length} Bab</span>
                      </div>
                      {activeCourse.lessonLimit && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-100">
                           <span className="text-[10px] font-black text-amber-600 uppercase">Limit: {activeCourse.lessonLimit} Pertemuan</span>
                        </div>
                      )}
                   </div>
                </div>

                {/* Chapters Accordion */}
                <div className="space-y-4">
                  <p className="text-[11px] font-black text-[var(--muted)] uppercase tracking-[0.2em] px-2">Daftar Bab Pembelajaran</p>
                  
                  {activeCourse.chapters.length === 0 ? (
                    <div className="text-center p-10 text-[var(--muted)] font-bold text-sm">Belum ada bab untuk kursus ini.</div>
                  ) : (
                    activeCourse.chapters.map((chapter) => {
                      const isExpanded = expandedChapterId === chapter.id;
                      
                      return (
                        <div key={chapter.id} className="bg-[var(--surface)] rounded-[24px] border border-[var(--border)] overflow-hidden shadow-sm transition-all duration-300">
                          {/* Accordion Header */}
                          <button
                            onClick={() => setExpandedChapterId(isExpanded ? null : chapter.id)}
                            className="w-full px-6 py-5 flex items-center justify-between bg-[var(--base)]/30 hover:bg-[var(--base)]/60 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-[16px] bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-lg font-black shrink-0">
                                {chapter.orderNumber}
                              </div>
                              <div className="text-left">
                                <h3 className="text-lg font-black text-[var(--text)] uppercase tracking-tight">{chapter.title}</h3>
                                {chapter.description && <p className="text-xs text-[var(--muted)] font-medium mt-0.5 line-clamp-1">{chapter.description}</p>}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 shrink-0">
                              <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest bg-[var(--primary)]/5 px-3 py-1 rounded-lg">
                                {chapter.lessons.length} Materi
                              </span>
                              <div className={`transition-transform duration-300 text-[var(--muted)] ${isExpanded ? "rotate-90" : ""}`}>
                                <ChevronRight size={20} strokeWidth={2.5} />
                              </div>
                            </div>
                          </button>

                          {/* Accordion Body (Lessons) */}
                          {isExpanded && (
                            <div className="border-t border-[var(--border)] bg-white">
                              {chapter.lessons.length === 0 ? (
                                <div className="p-8 text-center text-sm text-[var(--muted)] font-bold">Materi belum diupload untuk bab ini.</div>
                              ) : (
                                <div className="divide-y divide-[var(--border)]">
                                  {chapter.lessons.map(lesson => (
                                    <div key={lesson.id} className="flex items-center justify-between px-8 py-5 hover:bg-[var(--base)]/50 transition-colors group">
                                      <div className="flex items-center gap-4 min-w-0">
                                        <div className="h-10 w-10 rounded-[12px] bg-slate-50 border border-[var(--border)] flex items-center justify-center text-slate-400 shrink-0">
                                          <span className="text-sm font-black">{lesson.orderNumber}</span>
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-sm font-black uppercase tracking-tight text-[var(--text)] truncate">{lesson.title}</p>
                                          <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[8px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest bg-[var(--primary)]/10 text-[var(--primary)]">
                                              {lesson.type}
                                            </span>
                                            <span className="text-[9px] text-[var(--muted)] font-bold uppercase tracking-widest">
                                              {new Date(lesson.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {(lesson.contentUrl || lesson.youtubeUrl) ? (
                                        <button
                                          onClick={() => setPreviewLesson(lesson)}
                                          className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-[var(--primary-ink)] text-[10px] font-black uppercase tracking-widest shadow-md shadow-[var(--primary)]/20 hover:scale-105 transition-all active:scale-95"
                                        >
                                          Buka <ChevronRight size={14} strokeWidth={3} />
                                        </button>
                                      ) : (
                                        <span className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest">Tautan Kosong</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

// Reuse lucide icons
function ChevronRight({ size, strokeWidth }: { size: number, strokeWidth: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
