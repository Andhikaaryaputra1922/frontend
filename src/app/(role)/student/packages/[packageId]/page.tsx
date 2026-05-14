"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PremiumModal, Toast } from "@/shared/components/ui/PremiumFeedback";
import { Play, FileText, CreditCard, Send, ShieldCheck, ChevronRight, Info } from "lucide-react";

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

  const [proofFile, setProofFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [uniqueCode] = useState(Math.floor(Math.random() * 900) + 100);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [feedback, setFeedback] = useState<{ isOpen: boolean; title: string; message: string; type: any; onConfirm?: () => void } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pkgRes = await fetch(`/api/packages/store/${packageId}`, { credentials: "include" });
        if (pkgRes.status === 404) {
          setNotFound(true);
          return;
        }
        const pkgData = await pkgRes.json();
        if (pkgData?.package) {
          setPkg({
            ...pkgData.package,
            price: Number(pkgData.package.price)
          });
        }

        const userRes = await fetch("/api/auth/me", { credentials: "include" });
        const userData = await userRes.json();
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

  const handleMidtransPayment = async () => {
    if (!pkg) return;
    setProcessing(true);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id }),
      });

      const data = await res.json();
      if (res.ok && data.token) {
        window.snap.pay(data.token, {
          onSuccess: () => {
             setFeedback({
               isOpen: true,
               title: "Pembayaran Berhasil!",
               message: "Paket Anda telah aktif. Selamat belajar!",
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
        setToast({ message: data.message || "Gagal inisialisasi Midtrans", type: "error" });
      }
    } catch (e) {
      setToast({ message: "Sistem sibuk, coba lagi nanti", type: "error" });
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
        setFeedback({
          isOpen: true,
          title: "Bukti Terkirim!",
          message: "Admin akan memverifikasi pembayaran Anda maksimal 1x24 jam.",
          type: "success",
          onConfirm: () => router.push("/student")
        });
      } else {
        const d = await res.json();
        setToast({ message: d.message || "Gagal kirim bukti", type: "error" });
      }
    } catch {
      setToast({ message: "Error sistem", type: "error" });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <main className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
      <div className="h-10 w-10 border-2 border-[#8B0000] border-t-transparent rounded-full animate-spin" />
    </main>
  );

  if (notFound || !pkg) return (
    <main className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-10">
      <div className="text-center">
        <h2 className="text-2xl font-black text-slate-800 mb-4">Paket Tidak Ditemukan</h2>
        <Link href="/student/packages" className="px-8 py-3 rounded-xl bg-[#8B0000] text-white text-[10px] font-black uppercase tracking-widest">Kembali ke Katalog</Link>
      </div>
    </main>
  );

  const totalManual = pkg.price + 2500 + uniqueCode;

  return (
    <main className="min-h-screen bg-[#FDFDFD] pb-32">
      
      <div className="bg-[#1A1A1A] text-white pt-24 pb-48 px-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <ShieldCheck size={400} className="translate-x-20 -translate-y-20" />
         </div>
         <div className="max-w-6xl mx-auto relative z-10">
            <Link href="/student/packages" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#E5B54F] mb-8 hover:translate-x-[-4px] transition-transform">
               &larr; Kembali ke Katalog
            </Link>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
               <div className="max-w-2xl">
                  <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 leading-[1.1]">{pkg.name}</h1>
                  <p className="text-lg text-white/50 leading-relaxed font-medium">
                     {pkg.description || "Dapatkan akses penuh ke kurikulum terbaik untuk membantu Anda mencapai target belajar maksimal."}
                  </p>
               </div>
               <div className="shrink-0 text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E5B54F] mb-2">Total Investasi</p>
                  <p className="text-5xl font-black tracking-tighter">{formatPrice(pkg.price)}</p>
               </div>
            </div>
         </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-32 relative z-20">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* LEFT: Package Content */}
            <div className="lg:col-span-7 space-y-8">
               <section className="bg-white rounded-[48px] p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                  <div className="flex items-center justify-between mb-10">
                     <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        <div className="h-10 w-1.5 bg-[#8B0000] rounded-full" />
                        Isi Paket Belajar
                     </h2>
                     <span className="px-5 py-2 rounded-full bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-100">
                        {pkg.packageCourses.length} Kursus
                     </span>
                  </div>

                  <div className="space-y-10">
                     {pkg.packageCourses.map((pc, idx) => (
                        <div key={idx} className="group">
                           <div className="flex items-center gap-4 mb-6">
                              <div className="h-12 w-12 rounded-2xl bg-[#8B0000]/5 flex items-center justify-center text-[#8B0000] font-black">
                                 {idx + 1}
                              </div>
                              <div>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-[#8B0000]">{pc.course.category}</p>
                                 <h3 className="text-lg font-black text-slate-800">{pc.course.title}</h3>
                              </div>
                           </div>
                           
                           <div className="grid gap-6 ml-16">
                              {pc.course.chapters.length > 0 ? pc.course.chapters.map(chapter => (
                                 <div key={chapter.id} className="space-y-3">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                       <div className="h-1 w-1 rounded-full bg-slate-300" />
                                       {chapter.title}
                                    </h4>
                                    <div className="grid gap-2">
                                       {chapter.lessons.map(lesson => (
                                          <div key={lesson.id} className="flex items-center justify-between p-4 rounded-[20px] bg-[#FAF9F6] border border-transparent hover:border-[#8B0000]/10 hover:bg-white transition-all group/item">
                                             <div className="flex items-center gap-4">
                                                <div className="h-7 w-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover/item:text-[#8B0000] transition-colors">
                                                   {lesson.type === 'VIDEO' ? <Play size={12} fill="currentColor" /> : <FileText size={12} />}
                                                </div>
                                                <p className="text-xs font-bold text-slate-600">{lesson.title}</p>
                                             </div>
                                             <ChevronRight size={12} className="text-slate-200 group-hover/item:text-[#8B0000] transition-all" />
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              )) : (
                                 <div className="p-10 text-center border-2 border-dashed border-slate-100 rounded-[32px] text-slate-300 font-bold text-xs">
                                    Materi sedang dalam proses upload.
                                 </div>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>
               </section>
            </div>

            {/* RIGHT: Payment Options */}
            <div className="lg:col-span-5 space-y-8 sticky top-10">
               
               <section className="bg-white rounded-[48px] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
                  <div className="relative z-10">
                     <h2 className="text-xl font-black text-slate-800 mb-8">Pilih Metode Bayar</h2>
                     
                     <div className="space-y-4">
                        <button 
                           onClick={handleMidtransPayment}
                           disabled={processing}
                           className="w-full group flex items-center justify-between p-6 rounded-[32px] bg-slate-900 text-white hover:bg-[#8B0000] transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                           <div className="flex items-center gap-4">
                              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
                                 <CreditCard size={24} className="text-[#E5B54F]" />
                              </div>
                              <div className="text-left">
                                 <p className="text-xs font-black uppercase tracking-widest">Bayar Otomatis</p>
                                 <p className="text-[10px] text-white/50 font-medium">VA, Kartu, E-Wallet, QRIS</p>
                              </div>
                           </div>
                           <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/20 transition-all">
                              <ChevronRight size={18} />
                           </div>
                        </button>

                        <div className="relative py-4 flex items-center justify-center">
                           <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
                           <span className="relative px-4 bg-white text-[9px] font-black text-slate-300 uppercase tracking-widest">Atau Manual</span>
                        </div>

                        <div className="p-8 rounded-[32px] bg-[#FAF9F6] border border-slate-100">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Transfer Bank BRI / DANA</p>
                           <div className="space-y-3 mb-8">
                              <div className="p-4 rounded-2xl bg-white border border-slate-100 flex justify-between items-center">
                                 <div>
                                    <p className="text-[8px] font-black text-[#8B0000] uppercase tracking-widest mb-1">Bank BRI</p>
                                    <p className="text-sm font-black text-slate-800 tracking-tight">0172-0110-9122-508</p>
                                 </div>
                                 <button className="text-[9px] font-black uppercase text-[#8B0000]">Salin</button>
                              </div>
                              <div className="p-4 rounded-2xl bg-white border border-slate-100 flex justify-between items-center">
                                 <div>
                                    <p className="text-[8px] font-black text-[#8B0000] uppercase tracking-widest mb-1">DANA</p>
                                    <p className="text-sm font-black text-slate-800 tracking-tight">0857-0483-3249</p>
                                 </div>
                                 <button className="text-[9px] font-black uppercase text-[#8B0000]">Salin</button>
                              </div>
                           </div>

                           <div className="space-y-4 mb-8 pb-8 border-b border-slate-200/50">
                              <div className="flex justify-between text-xs font-bold text-slate-500">
                                 <span>Harga Paket</span>
                                 <span>{formatPrice(pkg.price)}</span>
                              </div>
                              <div className="flex justify-between text-xs font-bold text-slate-500">
                                 <span>Biaya Admin</span>
                                 <span>Rp 2.500</span>
                              </div>
                              <div className="flex justify-between text-xs font-bold text-[#8B0000]">
                                 <span>Kode Unik</span>
                                 <span>+{uniqueCode}</span>
                              </div>
                              <div className="flex justify-between items-end">
                                 <span className="text-xs font-black text-slate-800">Total Transfer</span>
                                 <span className="text-xl font-black text-slate-800 tracking-tighter">{formatPrice(totalManual)}</span>
                              </div>
                           </div>

                           <form onSubmit={handleManualPayment} className="space-y-4">
                              <div className="relative group">
                                 <input 
                                    type="file" 
                                    required 
                                    accept="image/*" 
                                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                 />
                                 <div className="p-5 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-white group-hover:border-[#8B0000] transition-all">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                       {proofFile ? `✅ ${proofFile.name.slice(0, 15)}...` : "Upload Bukti Transfer"}
                                    </p>
                                 </div>
                              </div>
                              <button 
                                 type="submit"
                                 disabled={processing || !proofFile}
                                 className="w-full flex items-center justify-center gap-2 bg-[#8B0000] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-red-900/10 hover:bg-red-800 transition-all disabled:opacity-50"
                              >
                                 <Send size={14} />
                                 Konfirmasi Manual
                              </button>
                           </form>
                        </div>
                     </div>
                  </div>
               </section>

               <div className="p-8 rounded-[40px] bg-slate-50 border border-slate-100 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#E5B54F] shrink-0">
                     <Info size={20} />
                  </div>
                  <div>
                     <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1">Butuh Bantuan?</p>
                     <p className="text-xs text-slate-400 leading-relaxed">Tim support kami siap membantu Anda 24/7 jika mengalami kendala pembayaran.</p>
                     <a href="#" className="inline-block mt-3 text-[10px] font-black text-[#8B0000] uppercase tracking-widest border-b border-[#8B0000]">Chat WhatsApp</a>
                  </div>
               </div>

            </div>

         </div>
      </div>

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

      {/* Midtrans Snap Script using Next.js Script component */}
      <Script 
        src="https://app.sandbox.midtrans.com/snap/snap.js" 
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
    </main>
  );
}
