"use client";

import { useState } from "react";
import { Award, Download, FileText, BookOpen, Package, Calendar, ExternalLink } from "lucide-react";

type Certificate = {
  id: string;
  certificateCode: string;
  issuedAt: string;
  pdfUrl?: string | null;
  course?: { id: string; title: string } | null;
  package?: { id: string; name: string } | null;
};

type Props = {
  certificates: Certificate[];
};

export default function StudentCertificatesClient({ certificates }: Props) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (cert: Certificate) => {
    if (!cert.pdfUrl) return;
    setDownloading(cert.id);
    try {
      const response = await fetch(cert.pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Sertifikat-${cert.certificateCode}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback: open in new tab
      window.open(cert.pdfUrl, "_blank");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-6 md:p-10">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <header className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-1.5">Akun Saya</p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Sertifikat <span className="text-[#0B213F]">Saya</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Sertifikat yang telah kamu raih dari Haneen Academy.
          </p>
        </header>

        {/* Content */}
        {certificates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
              <Award size={28} />
            </div>
            <p className="text-sm font-semibold text-slate-400">Belum Ada Sertifikat</p>
            <p className="mt-1 text-xs text-slate-300 max-w-xs mx-auto">
              Selesaikan kursus dan penuhi persyaratan kehadiran untuk mendapatkan sertifikat.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="group relative flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden"
              >
                {/* Top accent */}
                <div className="h-[3px] w-full bg-gradient-to-r from-[#0B213F] to-[#D4AF37]" />

                <div className="p-6 flex-1 flex flex-col">
                  {/* Badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D4AF37]/10 text-[#D4AF37]">
                      <Award size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#D4AF37]">Sertifikat</p>
                      <p className="text-[10px] text-slate-300 font-mono">{cert.certificateCode.slice(0, 18)}…</p>
                    </div>
                  </div>

                  {/* Course / Package */}
                  {cert.course && (
                    <div className="flex items-start gap-2 mb-2">
                      <BookOpen size={13} className="text-slate-400 mt-0.5 shrink-0" />
                      <p className="text-[13px] font-semibold text-slate-800 leading-snug">{cert.course.title}</p>
                    </div>
                  )}
                  {cert.package && (
                    <div className="flex items-start gap-2 mb-2">
                      <Package size={13} className="text-slate-400 mt-0.5 shrink-0" />
                      <p className="text-[12px] font-medium text-slate-600 leading-snug">{cert.package.name}</p>
                    </div>
                  )}
                  {!cert.course && !cert.package && (
                    <p className="text-[12px] font-medium text-slate-500 mb-2">Sertifikat Umum</p>
                  )}

                  {/* Date */}
                  <div className="flex items-center gap-2 mt-auto pt-4">
                    <Calendar size={12} className="text-slate-300 shrink-0" />
                    <p className="text-[11px] text-slate-400">
                      Diterbitkan {new Date(cert.issuedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    {cert.pdfUrl ? (
                      <>
                        <button
                          onClick={() => handleDownload(cert)}
                          disabled={downloading === cert.id}
                          className="flex flex-1 items-center justify-center gap-2 h-9 rounded-lg bg-[#0B213F] text-white text-[12px] font-semibold hover:bg-[#0B213F]/90 transition-all disabled:opacity-60"
                        >
                          {downloading === cert.id ? (
                            <span className="flex items-center gap-1.5">
                              <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                              Mengunduh...
                            </span>
                          ) : (
                            <>
                              <Download size={13} /> Unduh PDF
                            </>
                          )}
                        </button>
                        <a
                          href={cert.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                          title="Buka di tab baru"
                        >
                          <ExternalLink size={13} />
                        </a>
                      </>
                    ) : (
                      <div className="flex flex-1 items-center gap-2 h-9 rounded-lg border border-dashed border-slate-200 px-4">
                        <FileText size={13} className="text-slate-300" />
                        <span className="text-[11px] text-slate-300">PDF belum tersedia</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary footer */}
        {certificates.length > 0 && (
          <div className="mt-6 rounded-xl border border-slate-100 bg-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                <Award size={15} />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-slate-700">{certificates.length} Sertifikat Diraih</p>
                <p className="text-[10px] text-slate-400">
                  {certificates.filter(c => c.pdfUrl).length} PDF tersedia untuk diunduh
                </p>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full">
              Aktif
            </span>
          </div>
        )}
      </div>
    </main>
  );
}
