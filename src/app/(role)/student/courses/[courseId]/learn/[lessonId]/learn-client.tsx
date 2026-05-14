"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Menu, X, Play, CheckCircle, FileText, Download, Lock, Info, ArrowLeft } from "lucide-react";

type Lesson = {
  id: string;
  chapterId: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  attachmentUrl: string | null;
  type: string;
  durationInSeconds: number | null;
  isPreview: boolean;
};

type Chapter = {
  id: string;
  title: string;
  lessons: {
    id: string;
    title: string;
    type: string;
    isPreview: boolean;
  }[];
};

type Props = {
  courseId: string;
  lesson: Lesson;
  initialProgress: any;
  syllabus: Chapter[];
};

export function LearnClient({ courseId, lesson, initialProgress, syllabus }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isCompleted, setIsCompleted] = useState(initialProgress?.isCompleted ?? false);
  const [watchedSeconds, setWatchedSeconds] = useState(initialProgress?.watchedSeconds ?? 0);
  
  const saveProgressRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save progress every 10 seconds if it's a video
  useEffect(() => {
    if (lesson.type === 'VIDEO') {
      const interval = setInterval(() => {
        saveProgress();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [lesson.id, watchedSeconds]);

  const saveProgress = async (completed = false) => {
    try {
      await fetch(`/api/lessons/${lesson.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          watchedSeconds,
          isCompleted: completed || isCompleted
        }),
      });
      if (completed) setIsCompleted(true);
    } catch (e) {
      console.error("Failed to save progress", e);
    }
  };

  const findNextLesson = () => {
    let flatLessons: { id: string }[] = [];
    syllabus.forEach(c => {
      c.lessons.forEach(l => flatLessons.push(l));
    });
    const idx = flatLessons.findIndex(l => l.id === lesson.id);
    return flatLessons[idx + 1] || null;
  };

  const findPrevLesson = () => {
    let flatLessons: { id: string }[] = [];
    syllabus.forEach(c => {
      c.lessons.forEach(l => flatLessons.push(l));
    });
    const idx = flatLessons.findIndex(l => l.id === lesson.id);
    return flatLessons[idx - 1] || null;
  };

  const nextLesson = findNextLesson();
  const prevLesson = findPrevLesson();

  return (
    <div className="flex h-screen bg-[#0F0F0F] text-white overflow-hidden font-sans">
      
      {/* Left Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ${sidebarOpen ? "mr-0 lg:mr-[350px]" : "mr-0"}`}>
        
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-black/40 backdrop-blur-md sticky top-0 z-10">
           <div className="flex items-center gap-4">
              <Link href="/student/enrollments" className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all">
                 <ArrowLeft size={20} />
              </Link>
              <div className="hidden md:block">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E5B54F]">Learning Mode</p>
                 <h1 className="text-sm font-black truncate max-w-[400px]">{lesson.title}</h1>
              </div>
           </div>

           <div className="flex items-center gap-2">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all"
              >
                 {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
           </div>
        </header>

        {/* Player Section */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black">
           <div className="w-full aspect-video bg-black relative">
              {lesson.videoUrl ? (
                 <iframe 
                    src={lesson.videoUrl} 
                    className="absolute inset-0 w-full h-full" 
                    allow="autoplay; fullscreen; picture-in-picture" 
                    allowFullScreen
                    title={lesson.title}
                 />
              ) : (
                 <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
                    <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-6">
                       <FileText size={40} />
                    </div>
                    <h2 className="text-xl font-black mb-2">Materi Dokumen</h2>
                    <p className="text-white/40 text-sm max-w-md">Materi ini berupa dokumen atau tautan eksternal. Silakan cek detail di bawah.</p>
                 </div>
              )}
           </div>

           {/* Content Detail */}
           <div className="max-w-4xl mx-auto p-8 lg:p-12">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10 pb-10 border-b border-white/5">
                 <div>
                    <div className="flex items-center gap-3 mb-3">
                       <span className="px-3 py-1 rounded-full bg-[#8B0000] text-[9px] font-black uppercase tracking-widest text-white">Lesson Detail</span>
                       {isCompleted && (
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest">
                             <CheckCircle size={10} /> Completed
                          </span>
                       )}
                    </div>
                    <h2 className="text-3xl font-black tracking-tight">{lesson.title}</h2>
                    {lesson.description && <p className="mt-4 text-white/50 leading-relaxed text-sm lg:text-base">{lesson.description}</p>}
                 </div>

                 <div className="flex flex-col gap-3 shrink-0">
                    {!isCompleted && (
                       <button 
                        onClick={() => saveProgress(true)}
                        className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-[#E5B54F] transition-all shadow-xl shadow-white/5"
                       >
                          Tandai Selesai
                       </button>
                    )}
                    {lesson.attachmentUrl && (
                       <a 
                        href={lesson.attachmentUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                       >
                          <Download size={16} /> Unduh Materi PDF
                       </a>
                    )}
                 </div>
              </div>

              {/* Navigation Footer */}
              <div className="flex items-center justify-between pb-20">
                 {prevLesson ? (
                    <Link 
                      href={`/student/courses/${courseId}/learn/${prevLesson.id}`}
                      className="flex items-center gap-3 text-white/40 hover:text-white transition-all group"
                    >
                       <div className="h-10 w-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/5 transition-all">
                          <ChevronLeft size={20} />
                       </div>
                       <div className="hidden sm:block">
                          <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Sebelumnya</p>
                          <p className="text-[10px] font-bold">Materi Sebelumnya</p>
                       </div>
                    </Link>
                 ) : <div />}

                 {nextLesson ? (
                    <Link 
                      href={`/student/courses/${courseId}/learn/${nextLesson.id}`}
                      className="flex items-center gap-3 text-right text-white/40 hover:text-white transition-all group"
                    >
                       <div className="hidden sm:block">
                          <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Selanjutnya</p>
                          <p className="text-[10px] font-bold">Materi Berikutnya</p>
                       </div>
                       <div className="h-10 w-10 rounded-full bg-[#8B0000] flex items-center justify-center group-hover:bg-red-800 transition-all">
                          <ChevronRight size={20} className="text-white" />
                       </div>
                    </Link>
                 ) : <div />}
              </div>
           </div>
        </div>
      </div>

      {/* Right Sidebar - Syllabus */}
      <aside className={`fixed top-0 right-0 h-screen w-full lg:w-[350px] bg-[#141414] border-l border-white/5 z-40 transition-transform duration-500 ease-in-out ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
         <div className="flex flex-col h-full">
            <header className="p-6 border-b border-white/5 flex items-center justify-between">
               <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#E5B54F]">Daftar Materi</h3>
               <button className="lg:hidden" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
               {syllabus.map((chapter) => (
                  <div key={chapter.id} className="space-y-3">
                     <p className="px-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{chapter.title}</p>
                     <div className="space-y-1">
                        {chapter.lessons.map((l) => {
                           const isActive = l.id === lesson.id;
                           return (
                              <Link 
                                 key={l.id} 
                                 href={`/student/courses/${courseId}/learn/${l.id}`}
                                 className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${isActive ? "bg-[#8B0000] text-white shadow-lg shadow-red-900/20" : "hover:bg-white/5 text-white/60"}`}
                              >
                                 <div className={`shrink-0 h-8 w-8 rounded-xl flex items-center justify-center ${isActive ? "bg-white/20" : "bg-black/20"}`}>
                                    {l.type === 'VIDEO' ? <Play size={14} /> : <FileText size={14} />}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-black truncate">{l.title}</p>
                                    <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${isActive ? "text-white/60" : "text-white/20"}`}>
                                       {l.type === 'VIDEO' ? "Video" : "PDF"}
                                    </p>
                                 </div>
                                 {/* Progress icon placeholder */}
                              </Link>
                           );
                        })}
                     </div>
                  </div>
               ))}
            </div>

            <div className="p-6 border-t border-white/5 bg-black/40">
               <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Total Progres</p>
                  <p className="text-[10px] font-black text-[#E5B54F]">75%</p>
               </div>
               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#E5B54F] w-3/4 rounded-full" />
               </div>
            </div>
         </div>
      </aside>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
}
