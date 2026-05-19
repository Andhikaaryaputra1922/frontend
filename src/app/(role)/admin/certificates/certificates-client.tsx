"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { Award, Users, Layers, BookOpen, CheckCircle2, Search, ShieldCheck, Send, Loader2, Upload, Trash2, Download, FileText, Plus, X, RefreshCw } from "lucide-react";
import { Toast } from "@/shared/components/ui/PremiumFeedback";

/* ─── Types ──────────────────────────────── */
type Certificate = {
  id: string;
  certificateCode: string;
  issuedAt: string;
  pdfUrl?: string | null;
  user: { id: string; name: string; email: string };
  course?: { id: string; title: string } | null;
  package?: { id: string; name: string } | null;
};

type EligibilityItem = {
  student: { id: string; name: string; email: string; image: string | null };
  course: { id: string; title: string };
  attendanceCount: number;
  totalSessions: number;
  attendanceRate: number;
  isEligible: boolean;
  hasCertificate: boolean;
};

type Props = { batches: any[]; courses: any[] };

/* ─── Component ──────────────────────────── */
export default function AdminCertificateClient({ batches: serverBatches }: Props) {
  const [tab, setTab] = useState<"manage" | "auto">("manage");

  // --- Manage tab state ---
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [certsLoading, setCertsLoading] = useState(false);
  const [certsFetched, setCertsFetched] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" | "info" } | null>(null);

  // Issue form
  const [issueUserId, setIssueUserId] = useState("");
  const [issueCourseId, setIssueCourseId] = useState("");
  const [issuePackageId, setIssuePackageId] = useState("");
  const [issueBatchId, setIssueBatchId] = useState("");
  const [issueFile, setIssueFile] = useState<File | null>(null);
  const [issuing, setIssuing] = useState(false);
  const issueFileRef = useRef<HTMLInputElement>(null);

  // Modal data — fetched fresh on open
  const [students, setStudents] = useState<{ id: string; name: string; email: string }[]>([]);
  const [modalCourses, setModalCourses] = useState<{ id: string; title: string }[]>([]);
  const [modalBatches, setModalBatches] = useState<any[]>(serverBatches);
  const modalPackages = useMemo(() => {
    if (!issueBatchId) return [];
    return modalBatches.find(b => b.id === issueBatchId)?.packages || [];
  }, [issueBatchId, modalBatches]);

  // --- Auto tab state ---
  const [autoBatches, setAutoBatches] = useState<any[]>(serverBatches);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [matrix, setMatrix] = useState<EligibilityItem[]>([]);
  const [autoLoading, setAutoLoading] = useState(false);
  const [bulkIssuing, setBulkIssuing] = useState(false);

  const filteredPackages = useMemo(() => {
    if (!selectedBatch) return [];
    return autoBatches.find(b => b.id === selectedBatch)?.packages || [];
  }, [selectedBatch, autoBatches]);

  const showToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  /* ── Fetch all certs ── */
  const fetchCerts = useCallback(async () => {
    setCertsLoading(true);
    try {
      const res = await fetch("/api/certificates", { credentials: "include" });
      if (res.ok) {
        const d = await res.json();
        setCerts(d.certificates || []);
      }
    } catch { showToast("Gagal memuat sertifikat", "error"); }
    finally { setCertsLoading(false); setCertsFetched(true); }
  }, []);

  /* ── Fetch modal data (students + courses + batches) ── */
  const fetchModalData = useCallback(async () => {
    try {
      const [usersRes, coursesRes, batchesRes] = await Promise.all([
        fetch("/api/admin/users?role=STUDENT", { credentials: "include" }),
        fetch("/api/courses", { credentials: "include" }),
        fetch("/api/batches?includePackages=true", { credentials: "include" }),
      ]);
      if (usersRes.ok) { const d = await usersRes.json(); setStudents(d.users || []); }
      if (coursesRes.ok) { const d = await coursesRes.json(); setModalCourses(d.courses || []); }
      if (batchesRes.ok) { const d = await batchesRes.json(); setModalBatches(d.batches || []); setAutoBatches(d.batches || []); }
    } catch {}
  }, []);

  const handleTabChange = (t: "manage" | "auto") => {
    setTab(t);
    if (t === "manage" && !certsFetched) { fetchCerts(); }
  };

  /* ── Issue manual cert ── */
  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueUserId) return showToast("Pilih siswa terlebih dahulu", "error");
    setIssuing(true);
    const fd = new FormData();
    fd.append("userId", issueUserId);
    if (issueCourseId) fd.append("courseId", issueCourseId);
    if (issuePackageId) fd.append("packageId", issuePackageId);
    if (issueFile) fd.append("pdf", issueFile);
    try {
      const res = await fetch("/api/certificates/manual", { method: "POST", credentials: "include", body: fd });
      const d = await res.json();
      if (res.ok) {
        showToast("Sertifikat berhasil diterbitkan!");
        setShowIssueModal(false);
        setIssueUserId(""); setIssueCourseId(""); setIssuePackageId(""); setIssueBatchId(""); setIssueFile(null);
        fetchCerts();
      } else showToast(d.message || "Gagal menerbitkan", "error");
    } catch { showToast("Error jaringan", "error"); }
    finally { setIssuing(false); }
  };

  const openIssueModal = () => {
    setShowIssueModal(true);
    fetchModalData();
  };

  /* ── Upload / replace PDF ── */
  const handleReplacePdf = async (certId: string, file: File) => {
    const fd = new FormData();
    fd.append("pdf", file);
    try {
      const res = await fetch(`/api/certificates/${certId}/pdf`, { method: "PATCH", credentials: "include", body: fd });
      const d = await res.json();
      if (res.ok) {
        showToast("PDF berhasil diperbarui!");
        setCerts(prev => prev.map(c => c.id === certId ? { ...c, pdfUrl: d.certificate.pdfUrl } : c));
      } else showToast(d.message || "Gagal upload", "error");
    } catch { showToast("Error jaringan", "error"); }
  };

  /* ── Delete ── */
  const handleDelete = async (id: string) => {
    if (!confirm("Hapus sertifikat ini? Tindakan tidak dapat dibatalkan.")) return;
    try {
      const res = await fetch(`/api/certificates/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) { showToast("Sertifikat dihapus"); setCerts(prev => prev.filter(c => c.id !== id)); }
      else showToast("Gagal menghapus", "error");
    } catch { showToast("Error jaringan", "error"); }
  };

  /* ── Auto-issue ── */
  const fetchEligible = async () => {
    if (!selectedBatch || !selectedPackage) return;
    setAutoLoading(true);
    try {
      const res = await fetch(`/api/certificates/eligible?batchId=${selectedBatch}&packageId=${selectedPackage}`, { credentials: "include" });
      if (res.ok) { const d = await res.json(); setMatrix(d.eligibilityMatrix || []); }
    } catch { showToast("Gagal memuat data", "error"); }
    finally { setAutoLoading(false); }
  };

  const handleBulkIssue = async () => {
    const items = matrix.filter(m => m.isEligible && !m.hasCertificate).map(m => ({ userId: m.student.id, courseId: m.course.id }));
    if (!items.length) return showToast("Tidak ada sertifikat baru yang layak", "info");
    setBulkIssuing(true);
    try {
      const res = await fetch("/api/certificates/bulk-issue", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }) });
      const d = await res.json();
      if (res.ok) { showToast(`${items.length} sertifikat berhasil diterbitkan!`); fetchEligible(); }
      else showToast(d.message || "Gagal", "error");
    } catch { showToast("Error", "error"); }
    finally { setBulkIssuing(false); }
  };

  /* ─────────────────── RENDER ─────────────────── */
  return (
    <div className="pb-20">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800">Terbitkan Sertifikat</h3>
              <button onClick={() => setShowIssueModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleIssue} className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Siswa *</label>
                <select required value={issueUserId} onChange={e => setIssueUserId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B213F]/10 focus:border-[#0B213F]/30">
                  <option value="">-- Pilih Siswa --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
                </select>
                {students.length === 0 && <p className="text-[10px] text-slate-300 mt-1">Memuat daftar siswa...</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Angkatan (opsional)</label>
                  <select value={issueBatchId} onChange={e => { setIssueBatchId(e.target.value); setIssuePackageId(""); }}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B213F]/10 focus:border-[#0B213F]/30">
                    <option value="">-- Tidak --</option>
                    {modalBatches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Paket (opsional)</label>
                  <select value={issuePackageId} disabled={!issueBatchId} onChange={e => setIssuePackageId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B213F]/10 focus:border-[#0B213F]/30 disabled:opacity-40">
                    <option value="">-- Tidak --</option>
                    {modalPackages.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Kursus / Mapel (opsional)</label>
                <select value={issueCourseId} onChange={e => setIssueCourseId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B213F]/10 focus:border-[#0B213F]/30">
                  <option value="">-- Tidak dikaitkan --</option>
                  {modalCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
                {modalCourses.length === 0 && <p className="text-[10px] text-slate-300 mt-1">Belum ada kursus terdaftar</p>}
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Upload PDF Sertifikat (opsional)</label>
                <div
                  onClick={() => issueFileRef.current?.click()}
                  className="flex items-center gap-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3 cursor-pointer hover:border-[#0B213F]/30 hover:bg-slate-100 transition-all">
                  <Upload size={16} className="text-slate-400 shrink-0" />
                  <span className="text-[12px] text-slate-400 truncate">{issueFile ? issueFile.name : "Pilih file PDF..."}</span>
                </div>
                <input ref={issueFileRef} type="file" accept=".pdf" className="hidden"
                  onChange={e => setIssueFile(e.target.files?.[0] || null)} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowIssueModal(false)}
                  className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 transition-all">
                  Batal
                </button>
                <button type="submit" disabled={issuing}
                  className="flex-1 rounded-lg bg-[#0B213F] py-2.5 text-sm font-semibold text-white hover:bg-[#0B213F]/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {issuing ? <><Loader2 size={14} className="animate-spin" /> Memproses...</> : "Terbitkan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 rounded-xl p-1 w-fit">
        {(["manage", "auto"] as const).map(t => (
          <button key={t} onClick={() => handleTabChange(t)}
            className={`px-5 py-2 rounded-lg text-[12px] font-semibold transition-all ${tab === t ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}>
            {t === "manage" ? "Kelola Sertifikat" : "Auto-Issue"}
          </button>
        ))}
      </div>

      {/* ── MANAGE TAB ── */}
      {tab === "manage" && (
        <div className="space-y-5">
          {/* Header actions */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400 mb-1">
                {certsFetched ? `${certs.length} sertifikat diterbitkan` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchCerts} className="flex items-center gap-2 h-9 px-3 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all text-[12px]">
                <RefreshCw size={13} /> Refresh
              </button>
              <button onClick={() => { setShowIssueModal(true); fetchModalData(); }}
                className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#0B213F] text-white text-[12px] font-semibold hover:bg-[#0B213F]/90 transition-all">
                <Plus size={14} /> Terbitkan Sertifikat
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            {certsLoading ? (
              <div className="p-10 text-center">
                <Loader2 size={20} className="animate-spin text-slate-300 mx-auto" />
                <p className="text-xs text-slate-400 mt-3">Memuat sertifikat...</p>
              </div>
            ) : !certsFetched ? (
              <div className="p-10 text-center">
                <Award size={32} className="text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-400 mb-4">Klik refresh atau terbitkan sertifikat pertama</p>
                <button onClick={fetchCerts} className="mx-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-[12px] font-medium hover:bg-slate-100 transition-all">
                  <RefreshCw size={13} /> Muat Data
                </button>
              </div>
            ) : certs.length === 0 ? (
              <div className="p-10 text-center">
                <Award size={32} className="text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Belum ada sertifikat yang diterbitkan.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Siswa</th>
                    <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Kursus / Paket</th>
                    <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Kode</th>
                    <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Tanggal</th>
                    <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">PDF</th>
                    <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {certs.map(cert => (
                    <tr key={cert.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-5 py-4">
                        <p className="text-[12px] font-semibold text-slate-800 truncate max-w-[150px]">{cert.user.name}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{cert.user.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-[11px] font-medium text-slate-600 truncate max-w-[160px]">
                          {cert.course?.title || cert.package?.name || <span className="text-slate-300">—</span>}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <code className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{cert.certificateCode.slice(0, 16)}…</code>
                      </td>
                      <td className="px-5 py-4 text-[11px] text-slate-400 whitespace-nowrap">
                        {new Date(cert.issuedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-4">
                        {cert.pdfUrl ? (
                          <a href={cert.pdfUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 hover:text-emerald-700">
                            <FileText size={13} /> Lihat PDF
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-300">Belum ada</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {/* Upload/replace PDF */}
                          <label className="cursor-pointer flex items-center gap-1 text-[11px] font-medium text-[#0B213F] hover:text-[#0B213F]/70 transition-colors">
                            <Upload size={13} />
                            <span>{cert.pdfUrl ? "Ganti" : "Upload"}</span>
                            <input type="file" accept=".pdf" className="hidden"
                              onChange={async e => {
                                const f = e.target.files?.[0];
                                if (f) await handleReplacePdf(cert.id, f);
                                e.target.value = "";
                              }} />
                          </label>
                          <span className="text-slate-200">|</span>
                          <button onClick={() => handleDelete(cert.id)}
                            className="flex items-center gap-1 text-[11px] font-medium text-rose-400 hover:text-rose-600 transition-colors">
                            <Trash2 size={13} /> Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── AUTO TAB ── */}
      {tab === "auto" && (
        <div className="space-y-6">

          {/* Criteria banner */}
          <div className="flex items-start gap-3 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-5 py-4">
            <ShieldCheck size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-semibold text-slate-700">Kriteria Kelayakan Sertifikat</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Siswa berhak mendapat sertifikat per mata kuliah apabila <strong>hadir 100%</strong> dari seluruh sesi jadwal yang tercatat.
                Pilih angkatan dan paket untuk melihat status kehadiran masing-masing siswa.
              </p>
            </div>
          </div>

          {/* Selectors */}
          <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Angkatan</label>
              <select value={selectedBatch} onChange={e => { setSelectedBatch(e.target.value); setSelectedPackage(""); setMatrix([]); }}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B213F]/10 focus:border-[#0B213F]/30">
                <option value="">-- Pilih Angkatan --</option>
                {autoBatches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Paket</label>
              <select value={selectedPackage} disabled={!selectedBatch} onChange={e => { setSelectedPackage(e.target.value); setMatrix([]); }}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B213F]/10 focus:border-[#0B213F]/30 disabled:opacity-40">
                <option value="">-- Pilih Paket --</option>
                {filteredPackages.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <button onClick={fetchEligible} disabled={autoLoading || !selectedBatch || !selectedPackage}
              className="flex items-center gap-2 h-10 px-5 rounded-lg bg-[#0B213F] text-white text-[12px] font-semibold hover:bg-[#0B213F]/90 transition-all disabled:opacity-50">
              {autoLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Cek Kelayakan
            </button>
          </div>

          {matrix.length > 0 && (() => {
            const eligible = matrix.filter(m => m.isEligible && !m.hasCertificate);
            const alreadyIssued = matrix.filter(m => m.hasCertificate);
            const notEligible = matrix.filter(m => !m.isEligible && !m.hasCertificate);
            return (
              <div className="space-y-5">
                {/* Summary stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600 mb-1">Layak (Belum Terbit)</p>
                    <p className="text-2xl font-bold text-emerald-700">{eligible.length}</p>
                    <p className="text-[10px] text-emerald-500 mt-0.5">Hadir 100% — siap terbitkan</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-500 mb-1">Belum Cukup</p>
                    <p className="text-2xl font-bold text-slate-600">{notEligible.length}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Kehadiran belum 100%</p>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Sudah Terbit</p>
                    <p className="text-2xl font-bold text-slate-500">{alreadyIssued.length}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Sertifikat sudah dikirim</p>
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-slate-400">
                    Menampilkan {matrix.length} data (siswa × mata kuliah)
                  </p>
                  <button onClick={handleBulkIssue}
                    disabled={bulkIssuing || eligible.length === 0}
                    className="flex items-center gap-2 h-9 px-4 rounded-lg bg-[#D4AF37] text-[#0B213F] text-[12px] font-semibold hover:bg-[#c9a430] transition-all disabled:opacity-50">
                    {bulkIssuing ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                    Terbitkan {eligible.length} Sertifikat Layak
                  </button>
                </div>

                {/* Table */}
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Siswa</th>
                        <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Mata Kuliah</th>
                        <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Kehadiran</th>
                        <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">% Hadir</th>
                        <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {matrix.map(m => (
                        <tr key={`${m.student.id}-${m.course.id}`}
                          className={`hover:bg-slate-50/50 transition-colors ${m.isEligible && !m.hasCertificate ? "bg-emerald-50/30" : ""}`}>
                          <td className="px-5 py-3.5">
                            <p className="text-[12px] font-semibold text-slate-800">{m.student.name}</p>
                            <p className="text-[10px] text-slate-400">{m.student.email}</p>
                          </td>
                          <td className="px-5 py-3.5 text-[11px] font-medium text-slate-600">{m.course.title}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all ${m.attendanceRate === 100 ? "bg-emerald-500" : m.attendanceRate >= 75 ? "bg-amber-400" : "bg-rose-400"}`}
                                  style={{ width: `${m.attendanceRate}%` }} />
                              </div>
                              <span className="text-[11px] text-slate-500 font-mono">{m.attendanceCount}/{m.totalSessions}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`text-[12px] font-bold ${m.attendanceRate === 100 ? "text-emerald-600" : m.attendanceRate >= 75 ? "text-amber-500" : "text-rose-400"}`}>
                              {Math.round(m.attendanceRate)}%
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            {m.hasCertificate ? (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                                <CheckCircle2 size={11} /> Sudah Terbit
                              </span>
                            ) : m.isEligible ? (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded-full">
                                <ShieldCheck size={11} /> Layak ✓
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                                Belum Cukup
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
