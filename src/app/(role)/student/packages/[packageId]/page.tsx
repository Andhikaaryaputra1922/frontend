"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PremiumModal, Toast } from "@/shared/components/ui/PremiumFeedback";
import { Play, FileText, CreditCard, Send, ShieldCheck, ChevronRight, Info, CheckCircle2, Lock, Clock, Calendar, ArrowLeft, Copy, Zap, X, Wallet } from "lucide-react";

/* ─── Types ────────────────────────────────────────────────── */
interface PackageLesson {
  id: string;
  title: string;
  type: string;
  orderNumber: number;
}

interface PackageChapter {
  id: string;
  title: string;
  lessons: PackageLesson[];
}

interface PackageCourse {
  course: {
    id: string;
    title: string;
    category: string;
    chapters: PackageChapter[];
  };
}

interface PackageDetail {
  id: string;
  name: string;
  description: string | null;
  price: number;
  defaultLessonLimit: number;
  packageCourses: PackageCourse[];
}

interface StudentUser {
  name: string;
  email: string;
  phone?: string;
}

declare global {
  interface Window {
    snap: any;
  }
}

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

  const [activeCourse, setActiveCourse] = useState<number>(0);

  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number } | null>(null);
  const [voucherError, setVoucherError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pkgRes = await fetch(`/api/packages/store/${packageId}`, { credentials: "include" });
        if (pkgRes.status === 404) {
          setNotFound(true);
          return;
        }
        const pkgData = await pkgRes.json().catch(() => ({}));
        if (pkgData?.package) {
          setPkg({
            ...pkgData.package,
            price: Number(pkgData.package.price)
          });
        }

        const userRes = await fetch("/api/auth/me", { credentials: "include" });
        const userData = await userRes.json().catch(() => ({}));
        if (userData?.user) setUser(userData.user);
      } catch (err) {
        setToast({ message: "Gagal memuat data", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [packageId]);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(p);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setToast({ message: "Berhasil disalin!", type: "success" });
  };

  const handleMidtransPayment = async () => {
    if (!pkg) return;
    setProcessing(true);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.token) {
        window.snap.pay(data.token, {
          onSuccess: () => {
             setIsModalOpen(false);
             setFeedback({
               isOpen: true,
               title: "Selamat Datang!",
               message: "Materi belajar Anda sudah siap diakses.",
               type: "success",
               onConfirm: () => router.push("/student")
             });
          },
          onPending: () => {
             setToast({ message: "Menunggu pembayaran...", type: "success" });
          },
          onError: () => {
             setToast({ message: "Pembayaran gagal", type: "error" });
          }
        });
      } else {
        setToast({ message: data.message || "Gagal inisialisasi pembayaran", type: "error" });
      }
    } catch (e) {
      setToast({ message: "Terjadi kesalahan sistem", type: "error" });
    } finally {
      setProcessing(false);
    }
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

      if (res.ok) {
        setIsModalOpen(false);
        setFeedback({
          isOpen: true,
          title: "Selesai!",
          message: "Bukti transfer telah diterima. Tunggu validasi admin.",
          type: "success",
          onConfirm: () => router.push("/student")
        });
      } else {
        const d = await res.json().catch(() => ({}));
        setToast({ message: d.message || "Gagal kirim bukti", type: "error" });
      }
    } catch {
      setToast({ message: "Kesalahan sistem", type: "error" });
    } finally {
      setProcessing(false);
    }
  };

  const applyVoucher = () => {
    if (!pkg) return;
    setVoucherError("");
    const code = voucherCode.toUpperCase().trim();
    
    // Mock logic for demo/initial phase
    if (code === "HANEENGOLD") {
      setAppliedVoucher({ code, discount: pkg.price * 0.5 });
      setToast({ message: "Voucher 50% Applied!", type: "success" });
    } else if (code === "PROMO10") {
      setAppliedVoucher({ code, discount: pkg.price * 0.1 });
      setToast({ message: "Voucher 10% Applied!", type: "success" });
    } else {
      setVoucherError("Kode voucher tidak valid");
      setAppliedVoucher(null);
    }
  };

  const finalPrice = pkg ? pkg.price - (appliedVoucher?.discount || 0) : 0;
  const totalManual = finalPrice + 2500 + uniqueCode;

  if (loading) return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <div className="h-12 w-12 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
    </main>
  );

  if (notFound || !pkg) return (
    <main className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-6">
      <div className="text-center">
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">PACKAGE NOT FOUND</h2>
        <Link href="/student/packages" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
          <ArrowLeft size={14} /> Back to Catalog
        </Link>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#E5B54F] selection:text-white">
      
      {/* ── MINIMAL TOP BAR ──────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 h-20 bg-white/80 backdrop-blur-md z-[100] border-b border-slate-50">
        <div className="max-w-[1400px] mx-auto h-full px-10 flex items-center justify-between">
          <Link href="/student/packages" className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-slate-900 transition-all">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Kembali
          </Link>
          <div className="flex items-center gap-10">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Detail Paket</span>
              <span className="text-xs font-black uppercase">{pkg.name}</span>
            </div>
            <div className="h-10 w-px bg-slate-100" />
            <ShieldCheck size={24} className="text-[#E5B54F]" />
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-10 pt-40 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
          
          {/* LEFT: Course Info */}
          <div className="lg:col-span-8">
            <header className="mb-20">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 mb-8">
                <div className="h-1.5 w-1.5 rounded-full bg-[#E5B54F] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Premium Membership</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1] mb-8 uppercase max-w-3xl">
                {pkg.name}
              </h1>
              <p className="max-w-2xl text-lg text-slate-400 font-medium leading-relaxed">
                {pkg.description || "Program pembelajaran terstruktur yang dirancang untuk mempercepat penguasaan materi dengan kurikulum berbasis standar industri."}
              </p>
            </header>

            <section className="space-y-12">
              <div className="flex items-end justify-between border-b border-slate-100 pb-6">
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-900">Kurikulum & Silabus</h2>
                <span className="text-[10px] font-bold text-slate-300 uppercase">{pkg.packageCourses.length} Courses included</span>
              </div>

              <div className="space-y-4">
                {pkg.packageCourses.map((pc, idx) => (
                  <div key={idx} className={`rounded-[32px] overflow-hidden border transition-all duration-500 ${activeCourse === idx ? 'border-slate-900 bg-white' : 'border-slate-100 bg-slate-50/30'}`}>
                    <button 
                      onClick={() => setActiveCourse(idx)}
                      className="w-full p-8 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-6">
                        <span className={`text-2xl font-black tracking-tighter ${activeCourse === idx ? 'text-slate-900' : 'text-slate-200'}`}>0{idx + 1}</span>
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-[#E5B54F] mb-0.5">{pc.course.category}</p>
                          <h3 className="text-xl font-black uppercase tracking-tight">{pc.course.title}</h3>
                        </div>
                      </div>
                      <ChevronRight size={16} className={`transition-transform ${activeCourse === idx ? 'rotate-90 text-slate-900' : 'text-slate-200'}`} />
                    </button>

                    {activeCourse === idx && (
                      <div className="px-8 pb-8 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        {pc.course.chapters.map((chapter) => (
                          <div key={chapter.id}>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-2">{chapter.title}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {chapter.lessons.map(lesson => (
                                <div key={lesson.id} className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-50 hover:border-slate-200 transition-all group">
                                  <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-slate-900 transition-colors">
                                    {lesson.type === 'VIDEO' ? <Play size={12} fill="currentColor" /> : <FileText size={12} />}
                                  </div>
                                  <span className="text-xs font-bold text-slate-600 truncate">{lesson.title}</span>
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
            </section>
          </div>

          {/* RIGHT: Floating Summary Card */}
          <div className="lg:col-span-4 sticky top-32">
            <div className="bg-slate-50 rounded-[40px] p-10 md:p-12 border border-slate-100">
              <div className="flex items-center gap-3 mb-10">
                 <div className="h-1.5 w-1.5 rounded-full bg-[#E5B54F]" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ringkasan Paket</span>
              </div>
              
              <div className="space-y-6 mb-12">
                 <div className="flex justify-between items-end">
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">Investasi</span>
                    <span className="text-4xl font-black tracking-tighter text-slate-900">{formatPrice(pkg.price)}</span>
                 </div>
                 <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                       <CheckCircle2 size={16} className="text-[#E5B54F]" />
                       Akses {pkg.defaultLessonLimit > 0 ? `${pkg.defaultLessonLimit} Hari` : 'Selamanya'}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                       <CheckCircle2 size={16} className="text-[#E5B54F]" />
                       {pkg.packageCourses.length} Kursus Pilihan
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                       <CheckCircle2 size={16} className="text-[#E5B54F]" />
                       Sertifikat Digital
                    </div>
                 </div>
              </div>

              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-[#1A2E44] text-white py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-[#1A2E44]/20 hover:bg-[#E5B54F] hover:text-[#1A2E44] transition-all active:scale-[0.98]"
              >
                Beli Paket Sekarang
              </button>
              
              <p className="mt-8 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center justify-center gap-2">
                 <ShieldCheck size={14} /> Terenkripsi & Aman
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── PAYMENT MODAL ────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-10">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
           
           <div className="relative w-full max-w-4xl bg-white rounded-[48px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-2xl bg-slate-900 flex items-center justify-center text-[#E5B54F]">
                       <CreditCard size={20} />
                    </div>
                    <h2 className="text-lg font-black uppercase tracking-tight">Pilih Metode Pembayaran</h2>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-300 transition-colors">
                    <X size={20} />
                 </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                 <div className="max-w-2xl mx-auto space-y-12">
                    
                    {/* Voucher Section */}
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-2">Punya Kode Voucher?</p>
                       <div className="flex gap-3">
                          <div className="flex-1 relative">
                             <input 
                                type="text" 
                                placeholder="Masukkan kode promo..." 
                                value={voucherCode}
                                onChange={(e) => setVoucherCode(e.target.value)}
                                className={`w-full h-14 bg-slate-50 border rounded-2xl px-6 text-sm font-bold uppercase tracking-widest transition-all focus:outline-none ${voucherError ? 'border-red-200' : 'border-slate-100 focus:border-slate-900'}`}
                             />
                             {appliedVoucher && (
                                <div className="absolute top-1/2 right-4 -translate-y-1/2 h-6 px-3 bg-emerald-500 text-white rounded-full flex items-center gap-2 animate-in zoom-in-50">
                                   <CheckCircle2 size={12} />
                                   <span className="text-[8px] font-black uppercase">Applied</span>
                                </div>
                             )}
                          </div>
                          <button 
                             onClick={applyVoucher}
                             className="px-8 bg-[#1A2E44] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#E5B54F] hover:text-[#1A2E44] transition-all active:scale-[0.95]"
                          >
                             Terapkan
                          </button>
                       </div>
                       {voucherError && <p className="mt-2 ml-4 text-[9px] font-bold text-red-500 uppercase tracking-widest">{voucherError}</p>}
                    </div>

                    {/* Price Banner */}
                    <div className="bg-[#FFF4F4] rounded-[32px] p-8 space-y-4">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B0000]/40">Subtotal</span>
                          <span className="text-xl font-black tracking-tight text-slate-400 line-through decoration-red-900/20">{formatPrice(pkg.price)}</span>
                       </div>
                       {appliedVoucher && (
                          <div className="flex justify-between items-center animate-in slide-in-from-right-4">
                             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Diskon ({appliedVoucher.code})</span>
                             <span className="text-lg font-black tracking-tight text-emerald-600">-{formatPrice(appliedVoucher.discount)}</span>
                          </div>
                       )}
                       <div className="h-px bg-red-900/10 w-full" />
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B0000]/60">Total Pembayaran</span>
                          <span className="text-4xl font-black tracking-tighter text-[#8B0000]">{formatPrice(finalPrice)}</span>
                       </div>
                    </div>

                    {/* Method Selector */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <button 
                          onClick={() => setPaymentMethod("AUTOMATIC")}
                          className={`p-8 rounded-[32px] border-2 text-left transition-all relative overflow-hidden group ${paymentMethod === 'AUTOMATIC' ? 'border-[#8B0000] bg-white' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'}`}
                       >
                          <div className={`h-6 w-6 rounded-full border-2 mb-6 flex items-center justify-center transition-all ${paymentMethod === 'AUTOMATIC' ? 'border-[#8B0000] bg-[#8B0000]' : 'border-slate-200 bg-white'}`}>
                             {paymentMethod === 'AUTOMATIC' && <div className="h-2 w-2 rounded-full bg-white" />}
                          </div>
                          <p className="text-sm font-black uppercase tracking-widest mb-1">Bayar Otomatis</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">QRIS, VA, E-Wallet</p>
                          <div className="mt-8 flex gap-3 opacity-20 grayscale brightness-0 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                             <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg" className="h-3" alt="QRIS" />
                             <img src="https://upload.wikimedia.org/wikipedia/commons/c/c7/Logo_BRI.svg" className="h-3" alt="BRI" />
                             <img src="https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg" className="h-3" alt="DANA" />
                          </div>
                       </button>

                       <button 
                          onClick={() => setPaymentMethod("MANUAL")}
                          className={`p-8 rounded-[32px] border-2 text-left transition-all relative overflow-hidden group ${paymentMethod === 'MANUAL' ? 'border-[#8B0000] bg-white' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'}`}
                       >
                          <div className={`h-6 w-6 rounded-full border-2 mb-6 flex items-center justify-center transition-all ${paymentMethod === 'MANUAL' ? 'border-[#8B0000] bg-[#8B0000]' : 'border-slate-200 bg-white'}`}>
                             {paymentMethod === 'MANUAL' && <div className="h-2 w-2 rounded-full bg-white" />}
                          </div>
                          <p className="text-sm font-black uppercase tracking-widest mb-1">Transfer Manual</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Konfirmasi via Bukti</p>
                          <div className="mt-8 flex gap-3 opacity-20 grayscale brightness-0 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                             <Wallet size={16} className="text-slate-400" />
                          </div>
                       </button>
                    </div>

                    {/* Conditional Logic Based on Selection */}
                    {paymentMethod === "AUTOMATIC" && (
                       <div className="animate-in fade-in slide-in-from-bottom-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 text-center">Anda akan diarahkan ke gerbang pembayaran aman</p>
                          <button 
                             onClick={handleMidtransPayment}
                             disabled={processing}
                             className="w-full bg-[#1A2E44] text-white py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-xs hover:bg-slate-900 transition-all flex items-center justify-center gap-3"
                          >
                             {processing ? "Memproses..." : <><Zap size={16} /> Bayar Sekarang</>}
                          </button>
                       </div>
                    )}

                    {paymentMethod === "MANUAL" && (
                       <div className="animate-in fade-in slide-in-from-bottom-4 space-y-10">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 relative group">
                                <p className="text-[8px] font-black text-[#E5B54F] uppercase tracking-widest mb-1">BRI Official</p>
                                <p className="text-sm font-black tracking-widest text-slate-900">0172 0110 9122 508</p>
                                <button onClick={() => copyToClipboard('017201109122508')} className="absolute top-6 right-6 text-slate-300 hover:text-[#8B0000] transition-colors"><Copy size={14}/></button>
                             </div>
                             <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 relative group">
                                <p className="text-[8px] font-black text-[#E5B54F] uppercase tracking-widest mb-1">DANA Official</p>
                                <p className="text-sm font-black tracking-widest text-slate-900">0857 0483 3249</p>
                                <button onClick={() => copyToClipboard('085704833249')} className="absolute top-6 right-6 text-slate-300 hover:text-[#8B0000] transition-colors"><Copy size={14}/></button>
                             </div>
                          </div>

                          <div className="bg-slate-900 rounded-3xl p-8 text-white flex items-center justify-between">
                             <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-1">Wajib Transfer</p>
                                <p className="text-3xl font-black tracking-tighter text-[#E5B54F]">{formatPrice(totalManual)}</p>
                             </div>
                             <div className="text-right">
                                <p className="text-[8px] font-bold uppercase text-white/20 leading-tight">Termasuk kode unik<br/>untuk verifikasi cepat</p>
                             </div>
                          </div>

                          <form onSubmit={handleManualPayment} className="space-y-4">
                             <div className="relative group">
                                <input type="file" required accept="image/*" onChange={(e) => setProofFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                <div className="py-10 border-2 border-dashed border-slate-200 rounded-[32px] text-center group-hover:bg-slate-50 transition-all">
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                      {proofFile ? `FILE: ${proofFile.name.slice(0, 15)}...` : "Lampirkan Bukti Transfer"}
                                   </p>
                                </div>
                             </div>
                             <button 
                                type="submit"
                                disabled={processing || !proofFile}
                                className="w-full bg-[#1A2E44] text-white py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-xs hover:bg-[#E5B54F] hover:text-[#1A2E44] transition-all"
                             >
                                {processing ? "Memproses..." : "Konfirmasi Pembayaran"}
                             </button>
                          </form>
                       </div>
                    )}
                 </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 bg-slate-50/50 flex items-center justify-center gap-6 opacity-30 grayscale brightness-0">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg" className="h-3" alt="BCA" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/c/c7/Logo_BRI.svg" className="h-3" alt="BRI" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg" className="h-3" alt="DANA" />
              </div>
           </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {feedback && (
        <PremiumModal
          isOpen={feedback.isOpen}
          onClose={() => setFeedback(null)}
          onConfirm={feedback.onConfirm}
          title={feedback.title}
          message={feedback.message}
          type={feedback.type}
          confirmText="Mulai Belajar"
        />
      )}

      <Script 
        src="https://app.sandbox.midtrans.com/snap/snap.js" 
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
    </main>
  );
}
