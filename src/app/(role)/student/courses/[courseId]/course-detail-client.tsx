"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Play, FileText, CheckCircle, Lock } from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  type: string;
  isPreview: boolean;
  durationInSeconds: number | null;
};

type Chapter = {
  id: string;
  title: string;
  description: string | null;
  orderNumber: number;
  lessons: Lesson[];
};

type Course = {
  id: string;
  title: string;
  description: string;
};

export function CourseDetailClient({ course, chapters }: { course: Course, chapters: Chapter[] }) {
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

  const activeChapter = chapters.find(c => c.id === activeChapterId);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Chapter Cards Grid */}
      {!activeChapterId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {chapters.length === 0 ? (
            <div className="col-span-full rounded-[40px] border-2 border-dashed border-slate-200 p-20 text-center">
              
              <h3 className="text-xl font-bold text-slate-400">Belum ada bab yang dibuat untuk kursus ini.</h3>
            </div>
          ) : (
            chapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => setActiveChapterId(chapter.id)}
                className="group relative flex flex-col items-start bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden text-left"
              >
                <div className="absolute -right-6 -bottom-6 text-9xl font-black text-slate-50 opacity-50 group-hover:scale-125 transition-transform duration-700">
                  {chapter.orderNumber}
                </div>
                
                <div className="h-14 w-14 rounded-2xl bg-[#8B0000]/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-xl font-black text-[#8B0000]">{chapter.orderNumber}</span>
                </div>
                
                <h3 className="text-xl font-black text-[#0B213F] uppercase tracking-tight leading-tight mb-3 group-hover:text-[#8B0000] transition-colors">
                  {chapter.title}
                </h3>
                
                {chapter.description && (
                  <p className="text-sm font-medium text-slate-400 line-clamp-2 mb-6 relative z-10">
                    {chapter.description}
                  </p>
                )}
                
                <div className="mt-auto flex items-center gap-2 text-[10px] font-black text-[#8B0000] uppercase tracking-[0.2em] bg-[#8B0000]/5 px-5 py-2.5 rounded-full group-hover:bg-[#8B0000] group-hover:text-white transition-all">
                  Lihat Materi <ChevronRight size={14} strokeWidth={3} />
                </div>
              </button>
            ))
          )}
        </div>
      ) : (
        /* Detailed Chapter View (Lessons List) */
        <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
          <button 
            onClick={() => setActiveChapterId(null)}
            className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#8B0000] transition-colors group mb-4"
          >
            <span className="group-hover:-translate-x-1 transition-transform">← Kembali ke Daftar Bab</span>
          </button>

          <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-8 md:p-10 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-[#8B0000] uppercase tracking-[0.3em] mb-2">Bab {activeChapter?.orderNumber}</p>
                <h2 className="text-3xl font-black text-[#0B213F] uppercase tracking-tighter leading-tight">
                  {activeChapter?.title}
                </h2>
              </div>
              <div className="h-16 w-16 rounded-3xl bg-[#0B213F] text-[#D4AF37] flex items-center justify-center text-2xl font-black shadow-lg shadow-[#0B213F]/20">
                {activeChapter?.lessons.length}
              </div>
            </div>

            <div className="divide-y divide-slate-50">
              {activeChapter?.lessons.length === 0 ? (
                <div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                  Materi belum diunggah untuk bab ini.
                </div>
              ) : (
                activeChapter?.lessons.map((lesson) => (
                  <div 
                    key={lesson.id}
                    className="group flex items-center gap-6 p-8 hover:bg-slate-50/50 transition-all"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-[#0B213F] group-hover:bg-[#8B0000] group-hover:text-white transition-all shadow-sm">
                      {lesson.type === "VIDEO" ? <Play size={20} fill="currentColor" /> : <FileText size={20} />}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-base font-black text-[#0B213F] uppercase tracking-tight group-hover:text-[#8B0000] transition-colors">
                        {lesson.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span>{lesson.type}</span>
                        {lesson.durationInSeconds && (
                          <>
                            <span className="h-1 w-1 rounded-full bg-slate-200" />
                            <span>{Math.floor(lesson.durationInSeconds / 60)} Menit</span>
                          </>
                        )}
                      </div>
                    </div>

                    <Link 
                      href={`/student/courses/${course.id}/learn/${lesson.id}`}
                      className="px-6 py-3 rounded-2xl bg-[#0B213F] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#8B0000] hover:scale-105 transition-all shadow-lg active:scale-95"
                    >
                      Buka Materi
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
