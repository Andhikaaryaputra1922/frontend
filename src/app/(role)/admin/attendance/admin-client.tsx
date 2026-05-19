"use client";

import { useState, useMemo } from "react";
import { 
  Search, 
  User, BookOpen, Layers, CheckCircle2, MapPin,
  Clock, Calendar as CalendarIcon
} from "lucide-react";

type Props = {
  initialAttendances: any[];
  batches: any[];
  courses: any[];
};

export default function AdminAttendanceClient({ initialAttendances, batches, courses }: Props) {
  const [searchTerm, setSearchTerm]       = useState("");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("all");

  const filteredData = useMemo(() => {
    return initialAttendances.filter(item => {
      const matchSearch  = (item.student?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.student?.email || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchBatch   = selectedBatch === "all"   || item.batchId  === selectedBatch;
      const matchCourse  = selectedCourse === "all"  || item.courseId === selectedCourse;
      return matchSearch && matchBatch && matchCourse;
    });
  }, [searchTerm, selectedBatch, selectedCourse, initialAttendances]);

  const stats = useMemo(() => {
    const present = filteredData.filter(a => a.status === "HADIR").length;
    const permits = filteredData.filter(a => a.status === "IZIN" || a.status === "SAKIT").length;
    return { present, permits, total: filteredData.length };
  }, [filteredData]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Total Kehadiran</p>
            <p className="text-2xl font-bold text-[#0B213F] mt-0.5">{stats.present}</p>
            <p className="text-[9px] font-medium text-slate-400 mt-0.5">siswa tercatat hadir</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <CalendarIcon size={20} className="text-amber-500" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Izin / Sakit</p>
            <p className="text-2xl font-bold text-[#0B213F] mt-0.5">{stats.permits}</p>
            <p className="text-[9px] font-medium text-slate-400 mt-0.5">siswa dengan keterangan</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center shrink-0">
            <Layers size={20} className="text-[#D4AF37]" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Total Record</p>
            <p className="text-2xl font-bold text-[#0B213F] mt-0.5">{stats.total}</p>
            <p className="text-[9px] font-medium text-slate-400 mt-0.5">total data terfilter</p>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[220px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={15} />
          <input
            type="text"
            placeholder="Cari nama siswa atau email..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-11 pr-4 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]/50 focus:bg-white transition-all placeholder:text-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Batch Filter */}
        <div className="relative">
          <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <select
            className="bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-9 pr-8 text-[11px] font-semibold text-slate-600 uppercase tracking-wider appearance-none focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 hover:bg-white transition-all cursor-pointer"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
          >
            <option value="all">Semua Angkatan</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        {/* Course Filter */}
        <div className="relative">
          <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <select
            className="bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-9 pr-8 text-[11px] font-semibold text-slate-600 uppercase tracking-wider appearance-none focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 hover:bg-white transition-all cursor-pointer"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="all">Semua Kursus</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
      </div>

      {/* ── Data Table ── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Siswa</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Batch / Sesi</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Mata Pelajaran</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Waktu & Lokasi</th>
                <th className="px-6 py-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <div className="max-w-xs mx-auto">
                      <div className="h-14 w-14 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Search size={24} className="text-slate-300" />
                      </div>
                      <p className="text-sm font-semibold text-slate-400">Data tidak ditemukan</p>
                      <p className="text-xs text-slate-300 mt-1">Coba ubah kata kunci pencarian atau filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((h: any) => (
                  <tr key={h.id} className="hover:bg-slate-50/70 transition-colors duration-150 group">
                    {/* Siswa */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#0B213F] group-hover:text-white transition-all shrink-0">
                          <User size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 group-hover:text-[#0B213F] transition-colors">{h.student?.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{h.student?.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Batch / Sesi */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-[11px] font-semibold text-[#0B213F]">{h.schedule?.topic || "Live Session"}</p>
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-[8px] font-bold text-slate-500 uppercase tracking-wider">
                          {h.batch?.name || "Global"}
                        </span>
                      </div>
                    </td>

                    {/* Mata Pelajaran */}
                    <td className="px-6 py-4">
                      <p className="text-[11px] font-semibold text-slate-700">{h.course?.title}</p>
                    </td>

                    {/* Waktu & Lokasi */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500 mb-1">
                        <Clock size={11} className="text-emerald-400 shrink-0" />
                        {new Date(h.checkedAt).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                      </div>
                      {h.latitude && (
                        <div className="flex items-center gap-1.5 text-[9px] font-medium text-[#D4AF37]">
                          <MapPin size={9} />
                          {h.latitude.toFixed(4)}, {h.longitude.toFixed(4)}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${
                        h.status === 'HADIR' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        h.status === 'IZIN'  ? "bg-amber-50  text-amber-600  border-amber-100"  :
                        h.status === 'SAKIT' ? "bg-blue-50   text-blue-600   border-blue-100"   :
                        "bg-slate-100 text-slate-400 border-slate-200"
                      }`}>
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
