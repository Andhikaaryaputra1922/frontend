"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PremiumModal, Toast } from "@/shared/components/ui/PremiumFeedback";
import { Play, FileText, CreditCard, ShieldCheck, ChevronDown, CheckCircle2, ArrowLeft, Copy, X, Wallet } from "lucide-react";

/* ─── Types ─── */
interface PackageLesson { id: string; title: string; type: string; orderNumber: number }
interface PackageChapter { id: string; title: string; lessons: PackageLesson[] }
interface PackageCourse { course: { id: string; title: string; category: string; chapters: PackageChapter[] } }
interface PackageDetail {
  id: string; name: string; description: string | null; price: number; defaultLessonLimit: number;
  batch: { id: string; name: string; maxStudents: number; _count: { enrollments: number } } | null;
  packageCourses: PackageCourse[];
}
interface StudentUser { name: string; email: string; phone?: string }

declare global { interface Window { snap: any } }

export default function PackageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params.packageId as string;

  const [pkg, setPkg] = useState<PackageDetail | null>(null);
  const [user, setUser] = useState<StudentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"AUTOMATIC" | "MANUAL" | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [uniqueCode] = useState(Math.floor(Math.random() * 900) + 100);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [feedback, setFeedback] = useState<{ isOpen: boolean; title: string; message: string; type: any; onConfirm?: () => void } | null>(null);

  const [openCourse, setOpenCourse] = useState<number | null>(0);

  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number } | null>(null);
  const [voucherError, setVoucherError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pkgRes = await fetch(`/api/packages/store/${packageId}`, { credentials: "include" });
        if (pkgRes.status === 404) { setNotFound(true); return; }
        const pkgData = await pkgRes.json().catch(() => ({}));
        if (pkgData?.package) setPkg({ ...pkgData.package, price: Number(pkgData.package.price) });

        const userRes = await fetch("/api/auth/me", { credentials: "include" });
        const userData = await userRes.json().catch(() => ({}));
        if (userData?.user) setUser(userData.user);
      } catch { setToast({ message: "Gagal memuat data", type: "error" }); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [packageId]);

  const formatPrice = (p: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(p);
  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); setToast({ message: "Berhasil disalin!", type: "success" }); };

  const handleMidtransPayment = async () => {
    if (!pkg) return;
    setProcessing(true);
    try {
      const res = await fetch("/api/payments/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ packageId: pkg.id }) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.token) {
        window.snap.pay(data.token, {
          onSuccess: () => { setIsModalOpen(false); setFeedback({ isOpen: true, title: "Selamat Datang!", message: "Materi belajar Anda sudah siap diakses.", type: "success", onConfirm: () => router.push("/student") }); },
          onPending: () => { setToast({ message: "Menunggu pembayaran...", type: "success" }); },
          onError: () => { setToast({ message: "Pembayaran gagal", type: "error" }); }
        });
      } else { setToast({ message: data.message || "Gagal inisialisasi pembayaran", type: "error" }); }
    } catch { setToast({ message: "Terjadi kesalahan sistem", type: "error" }); }
    finally { setProcessing(false); }
  };

  const handleManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFile) return;
    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append("packageId", pkg!.id);
      formData.append("proof", proofFile);
      formData.append("notes", `Manual Transfer (Code: ${uniqueCode})`);
      const res = await fetch("/api/payments/manual", { method: "POST", credentials: "include", body: formData });
      if (res.ok) { setIsModalOpen(false); setFeedback({ isOpen: true, title: "Selesai!", message: "Bukti transfer telah diterima. Tunggu validasi admin.", type: "success", onConfirm: () => router.push("/student") }); }
      else { const d = await res.json().catch(() => ({})); setToast({ message: d.message || "Gagal kirim bukti", type: "error" }); }
    } catch { setToast({ message: "Kesalahan sistem", type: "error" }); }
    finally { setProcessing(false); }
  };

  const applyVoucher = () => {
    if (!pkg) return;
    setVoucherError("");
    const code = voucherCode.toUpperCase().trim();
    if (code === "HANEENGOLD") { setAppliedVoucher({ code, discount: pkg.price * 0.5 }); setToast({ message: "Voucher 50% Applied!", type: "success" }); }
    else if (code === "PROMO10") { setAppliedVoucher({ code, discount: pkg.price * 0.1 }); setToast({ message: "Voucher 10% Applied!", type: "success" }); }
    else { setVoucherError("Kode voucher tidak valid"); setAppliedVoucher(null); }
  };

  const finalPrice = pkg ? pkg.price - (appliedVoucher?.discount || 0) : 0;
  const totalManual = finalPrice + 2500 + uniqueCode;
  const totalLessons = pkg?.packageCourses.reduce((sum, pc) => sum + pc.course.chapters.reduce((s, ch) => s + ch.lessons.length, 0), 0) || 0;

  if (loading) return (
    <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="h-8 w-8 border-2 border-[#0B213F] border-t-transparent rounded-full animate-spin" />
    </main>
  );

  if (notFound || !pkg) return (
    <main className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="text-center">
        <p className="text-lg font-bold text-slate-800 mb-3">Paket tidak ditemukan</p>
        <Link href="/student/packages" className="text-sm font-semibold text-[#0B213F] hover:underline">Kembali ke katalog</Link>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <Link href="/student/packages" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-[#0B213F] transition mb-6">
            <ArrowLeft size={16} /> Kembali
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] mb-2">Premium Package</p>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#0B213F]">{pkg.name}</h1>
              {pkg.description && <p className="mt-2 text-sm text-slate-500 max-w-xl">{pkg.description}</p>}
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Harga</p>
                <p className="text-2xl font-bold text-[#0B213F]">{formatPrice(pkg.price)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: Curriculum */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-slate-800">Kurikulum</h2>
              <span className="text-xs text-slate-400">{pkg.packageCourses.length} kursus · {totalLessons} materi</span>
            </div>

            {pkg.packageCourses.map((pc, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <button
                  onClick={() => setOpenCourse(openCourse === idx ? null : idx)}
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-50/50 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-lg bg-[#0B213F]/5 flex items-center justify-center text-sm font-bold text-[#0B213F]">
                      {(idx + 1).toString().padStart(2, '0')}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">{pc.course.category}</p>
                      <p className="text-sm font-semibold text-slate-800">{pc.course.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-medium text-slate-400">{pc.course.chapters.reduce((s, c) => s + c.lessons.length, 0)} materi</span>
                    <ChevronDown size={16} className={`text-slate-300 transition-transform ${openCourse === idx ? "rotate-180" : ""}`} />
                  </div>
                </button>

                {openCourse === idx && (
                  <div className="border-t border-slate-100 px-5 pb-5 pt-4 space-y-5">
                    {pc.course.chapters.map((chapter) => (
                      <div key={chapter.id}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">{chapter.title}</p>
                        <div className="space-y-1.5">
                          {chapter.lessons.map(lesson => (
                            <div key={lesson.id} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-50 transition">
                              <div className="h-7 w-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-400">
                                {lesson.type === 'VIDEO' ? <Play size={11} fill="currentColor" /> : <FileText size={11} />}
                              </div>
                              <span className="text-sm text-slate-600">{lesson.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right: Sticky CTA */}
          <div className="lg:sticky lg:top-8">
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Investasi</p>
                <p className="text-3xl font-bold tracking-tight text-[#0B213F]">{formatPrice(pkg.price)}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <CheckCircle2 size={16} className="text-[#D4AF37] shrink-0" />
                  Akses {pkg.defaultLessonLimit > 0 ? `${pkg.defaultLessonLimit} hari` : 'selamanya'}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <CheckCircle2 size={16} className="text-[#D4AF37] shrink-0" />
                  {pkg.packageCourses.length} kursus · {totalLessons} materi
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <CheckCircle2 size={16} className="text-[#D4AF37] shrink-0" />
                  Sertifikat digital
                </div>
              </div>

              {(() => {
                const maxStudents = pkg.batch?.maxStudents || 0;
                const enrolled = pkg.batch?._count?.enrollments || 0;
                const isFull = maxStudents > 0 && enrolled >= maxStudents;

                return isFull ? (
                  <button disabled className="w-full py-3.5 rounded-xl bg-slate-100 text-slate-400 text-sm font-bold cursor-not-allowed">
                    Batch Penuh
                  </button>
                ) : (
                  <button onClick={() => setIsModalOpen(true)} className="w-full py-3.5 rounded-xl bg-[#0B213F] text-white text-sm font-bold hover:bg-[#0B213F]/90 transition active:scale-[0.98]">
                    Beli Paket
                  </button>
                );
              })()}

              <p className="text-center text-[10px] font-medium text-slate-300 flex items-center justify-center gap-1.5">
                <ShieldCheck size={12} /> Pembayaran aman & terenkripsi
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center"><CreditCard size={18} className="text-slate-600" /></div>
                <h2 className="text-base font-bold text-slate-900">Pembayaran</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"><X size={18} /></button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Voucher */}
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">Kode Voucher</p>
                <div className="flex gap-2">
                  <input
                    type="text" placeholder="Masukkan kode..." value={voucherCode} onChange={(e) => setVoucherCode(e.target.value)}
                    className={`flex-1 h-11 bg-slate-50 border rounded-lg px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0B213F]/10 ${voucherError ? 'border-red-300' : 'border-slate-200 focus:border-[#0B213F]'}`}
                  />
                  <button onClick={applyVoucher} className="px-5 h-11 bg-[#0B213F] text-white rounded-lg text-xs font-bold hover:bg-[#0B213F]/90 transition">Terapkan</button>
                </div>
                {voucherError && <p className="mt-1.5 text-xs text-red-500">{voucherError}</p>}
                {appliedVoucher && <p className="mt-1.5 text-xs text-emerald-600 font-medium">Diskon {appliedVoucher.code} diterapkan</p>}
              </div>

              {/* Price Summary */}
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className={`font-medium ${appliedVoucher ? "text-slate-400 line-through" : "text-slate-800"}`}>{formatPrice(pkg.price)}</span>
                </div>
                {appliedVoucher && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600">Diskon</span>
                    <span className="font-medium text-emerald-600">-{formatPrice(appliedVoucher.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-3 border-t border-slate-200">
                  <span className="font-bold text-slate-800">Total</span>
                  <span className="text-xl font-bold text-[#0B213F]">{formatPrice(finalPrice)}</span>
                </div>
              </div>

              {/* Method */}
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-3">Metode Pembayaran</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod("AUTOMATIC")}
                    className={`p-4 rounded-xl border-2 text-left transition ${paymentMethod === 'AUTOMATIC' ? 'border-[#0B213F] bg-[#0B213F]/5' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <p className="text-sm font-bold text-slate-800 mb-0.5">Otomatis</p>
                    <p className="text-[10px] text-slate-400">QRIS, VA, E-Wallet</p>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("MANUAL")}
                    className={`p-4 rounded-xl border-2 text-left transition ${paymentMethod === 'MANUAL' ? 'border-[#0B213F] bg-[#0B213F]/5' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <p className="text-sm font-bold text-slate-800 mb-0.5">Transfer Manual</p>
                    <p className="text-[10px] text-slate-400">BRI / DANA</p>
                  </button>
                </div>
              </div>

              {/* Automatic */}
              {paymentMethod === "AUTOMATIC" && (
                <button
                  onClick={handleMidtransPayment} disabled={processing}
                  className="w-full py-3.5 rounded-xl bg-[#0B213F] text-white text-sm font-bold hover:bg-[#0B213F]/90 transition disabled:opacity-50"
                >
                  {processing ? "Memproses..." : "Bayar Sekarang"}
                </button>
              )}

              {/* Manual */}
              {paymentMethod === "MANUAL" && (
                <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 relative">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2e/BRI_2020.svg" alt="BRI" className="h-4 mb-2" />
                      <p className="text-xs font-bold text-slate-800">0172 0110 9122 508</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">a.n. Haneen Academy</p>
                      <button onClick={() => copyToClipboard('017201109122508')} className="absolute top-3 right-3 text-slate-300 hover:text-[#0B213F]"><Copy size={12}/></button>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 relative">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg" alt="DANA" className="h-4 mb-2" />
                      <p className="text-xs font-bold text-slate-800">0857 0483 3249</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">a.n. Haneen Academy</p>
                      <button onClick={() => copyToClipboard('085704833249')} className="absolute top-3 right-3 text-slate-300 hover:text-[#0B213F]"><Copy size={12}/></button>
                    </div>
                  </div>

                  <div className="bg-[#0B213F]/5 rounded-xl p-4 text-center">
                    <p className="text-[10px] font-medium text-slate-500 mb-1">Total Transfer</p>
                    <p className="text-xl font-bold text-[#0B213F]">{formatPrice(totalManual)}</p>
                  </div>

                  <form onSubmit={handleManualPayment} className="space-y-3">
                    <div className="relative">
                      <input type="file" required accept="image/*" onChange={(e) => setProofFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className="py-8 border-2 border-dashed border-slate-200 rounded-xl text-center bg-slate-50 hover:bg-slate-100 transition">
                        <p className="text-xs font-semibold text-slate-400">{proofFile ? proofFile.name : "Lampirkan bukti transfer"}</p>
                      </div>
                    </div>
                    <button type="submit" disabled={processing || !proofFile} className="w-full py-3.5 rounded-xl bg-[#0B213F] text-white text-sm font-bold hover:bg-[#0B213F]/90 transition disabled:opacity-50">
                      {processing ? "Memproses..." : "Konfirmasi Pembayaran"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {feedback && (
        <PremiumModal isOpen={feedback.isOpen} onClose={() => setFeedback(null)} onConfirm={feedback.onConfirm}
          title={feedback.title} message={feedback.message} type={feedback.type} confirmText="Mulai Belajar" />
      )}

      <Script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} strategy="lazyOnload" />
    </main>
  );
}
