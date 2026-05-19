"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, X, Image as ImageIcon, Globe, Clock, Award, Info, AlertCircle, Trash2, ArrowRight } from "lucide-react";
import { Toast } from "@/shared/components/ui/PremiumFeedback";

type Props = {
  initialData?: any;
  courseId?: string;
};

export function CourseForm({ initialData, courseId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    level: initialData?.level || "BEGINNER",
    price: initialData?.price || 0,
    discountPrice: initialData?.discountPrice || "",
    accessType: initialData?.accessType || "PREMIUM",
    duration: initialData?.duration || "",
    language: initialData?.language || "Indonesian",
    prerequisites: initialData?.prerequisites || "",
    targetAudience: initialData?.targetAudience || "",
    hasCertificate: initialData?.hasCertificate ?? true,
    requireExam: initialData?.requireExam ?? false,
    status: initialData?.status || "DRAFT",
  });

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialData?.thumbnailUrl || null);

  // Auto-generate slug from title
  useEffect(() => {
    if (!initialData && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        fd.append(key, String(val));
      });
      if (thumbnail) fd.append("thumbnail", thumbnail);

      const url = courseId ? `/api/courses/${courseId}` : "/api/courses";
      const method = courseId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        body: fd,
      });

      if (res.ok) {
        const data = await res.json();
        setToast({ message: courseId ? "Kursus diperbarui" : "Kursus berhasil dibuat!", type: "success" });
        
        // After creating, redirect to curriculum builder
        setTimeout(() => {
          router.push(`/teacher/courses/${courseId || data.course.id}/content`);
        }, 1000);
      } else {
        const err = await res.json();
        setToast({ message: err.message || "Gagal menyimpan", type: "error" });
      }
    } catch (error) {
      setToast({ message: "Terjadi kesalahan sistem", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* Top Info Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-white border border-slate-100 rounded-2xl shadow-sm">
           <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-[#0B213F] flex items-center justify-center text-[#D4AF37] shadow-lg shadow-[#0B213F]/10">
                 <Info size={28} />
              </div>
              <div>
                 <h2 className="text-xl font-black text-slate-800">Detail Metadata Kursus</h2>
                 <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Langkah 1 dari 2: Informasi Dasar & Teknis</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <button 
                type="button" 
                onClick={() => router.back()}
                className="px-8 py-4 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all"
              >
                 Batal
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex items-center gap-2 px-10 py-4 rounded-2xl bg-[#0B213F] text-white text-[10px] font-black uppercase tracking-widest hover:bg-#0d2847 transition-all shadow-xl shadow-[#0B213F]/10"
              >
                 {loading ? 'Menyimpan...' : (courseId ? 'Simpan Perubahan' : 'Lanjut ke Kurikulum')}
                 <ArrowRight size={14} />
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           
           {/* Left Column: Visual & Status */}
           <div className="space-y-8">
              <div className="p-8 bg-white border border-slate-100 rounded-2xl shadow-sm">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0B213F] mb-6">Thumbnail Kursus</p>
                 <div className="aspect-[4/3] rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden relative group">
                    {preview ? (
                       <img src={preview} className="w-full h-full object-cover" />
                    ) : (
                       <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                          <ImageIcon size={40} className="mb-2" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Pilih Gambar</p>
                       </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                       <p className="text-white text-[10px] font-black uppercase tracking-widest">Ganti Thumbnail</p>
                    </div>
                 </div>
                 <p className="text-[9px] text-slate-400 mt-4 italic text-center">* Rekomendasi: 1200x900px (PNG/JPG)</p>
              </div>

              <div className="p-8 bg-white border border-slate-100 rounded-2xl shadow-sm">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Visibilitas & Status</p>
                 <div className="space-y-4">
                    <div>
                       <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Status Publikasi</label>
                       <select 
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-transparent focus:border-[#0B213F] outline-none text-xs font-bold"
                       >
                          <option value="DRAFT">DRAFT (Internal)</option>
                          <option value="PUBLISHED">PUBLISHED (Live)</option>
                          <option value="ARCHIVED">ARCHIVED (Selesai)</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Tipe Akses</label>
                       <select 
                        value={formData.accessType}
                        onChange={(e) => setFormData({...formData, accessType: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-transparent focus:border-[#0B213F] outline-none text-xs font-bold"
                       >
                          <option value="PREMIUM">PREMIUM (Berbayar)</option>
                          <option value="FREE">FREE (Gratis)</option>
                          <option value="SUBSCRIPTION">SUBSCRIPTION (Langganan)</option>
                          <option value="PRIVATE">PRIVATE (Khusus Link)</option>
                       </select>
                    </div>
                 </div>
              </div>
           </div>

           {/* Middle & Right Column: Details */}
           <div className="lg:col-span-2 space-y-10">
              <section className="p-10 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-2">
                       <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Judul Kursus</label>
                       <input 
                        type="text" 
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Contoh: UI/UX Mastery dari Dasar ke Pro"
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-[#0B213F] outline-none text-sm font-bold transition-all"
                       />
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Friendly Slug (SEO)</label>
                       <input 
                        type="text" 
                        required
                        value={formData.slug}
                        onChange={(e) => setFormData({...formData, slug: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-[#0B213F] outline-none text-sm font-bold transition-all"
                       />
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Deskripsi Lengkap</label>
                       <textarea 
                        rows={4}
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Jelaskan apa yang akan dipelajari siswa..."
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-[#0B213F] outline-none text-sm font-bold transition-all"
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Kategori</label>
                       <input 
                        type="text" 
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        placeholder="Desain, Programming, Bisnis..."
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-[#0B213F] outline-none text-sm font-bold transition-all"
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Tingkat Kesulitan</label>
                       <select 
                        value={formData.level}
                        onChange={(e) => setFormData({...formData, level: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-[#0B213F] outline-none text-sm font-bold transition-all"
                       >
                          <option value="BEGINNER">BEGINNER (Dasar)</option>
                          <option value="INTERMEDIATE">INTERMEDIATE (Menengah)</option>
                          <option value="ADVANCED">ADVANCED (Mahir)</option>
                       </select>
                    </div>
                 </div>
              </section>

              {/* Pricing Section */}
              <section className="p-10 bg-white border border-slate-100 rounded-2xl shadow-sm">
                 <div className="flex items-center gap-3 mb-8">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                       <Globe size={20} />
                    </div>
                    <h3 className="text-lg font-black text-slate-800">Sistem Harga & Diskon</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                       <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Harga Normal (IDR)</label>
                       <input 
                        type="number" 
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-[#0B213F] outline-none text-sm font-bold transition-all"
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Harga Diskon (IDR) - Opsional</label>
                       <input 
                        type="number" 
                        value={formData.discountPrice}
                        onChange={(e) => setFormData({...formData, discountPrice: e.target.value})}
                        placeholder="Kosongkan jika tidak diskon"
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-[#0B213F] outline-none text-sm font-bold transition-all"
                       />
                    </div>
                 </div>
              </section>

              {/* Metadata Section */}
              <section className="p-10 bg-white border border-slate-100 rounded-2xl shadow-sm">
                 <div className="flex items-center gap-3 mb-8">
                    <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                       <Clock size={20} />
                    </div>
                    <h3 className="text-lg font-black text-slate-800">Metadata Pembelajaran</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                       <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Estimasi Durasi (Jam)</label>
                       <input 
                        type="text" 
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        placeholder="Contoh: 12 Jam 30 Menit"
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-[#0B213F] outline-none text-sm font-bold transition-all"
                       />
                    </div>
                    <div>
                       <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Bahasa Pengantar</label>
                       <input 
                        type="text" 
                        value={formData.language}
                        onChange={(e) => setFormData({...formData, language: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-[#0B213F] outline-none text-sm font-bold transition-all"
                       />
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Prasyarat (Prerequisites)</label>
                       <input 
                        type="text" 
                        value={formData.prerequisites}
                        onChange={(e) => setFormData({...formData, prerequisites: e.target.value})}
                        placeholder="Contoh: Paham dasar komputer, Memiliki aplikasi Figma..."
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-transparent focus:bg-white focus:border-[#0B213F] outline-none text-sm font-bold transition-all"
                       />
                    </div>
                 </div>
              </section>

              {/* Extras Section */}
              <section className="p-10 bg-white border border-slate-100 rounded-2xl shadow-sm">
                 <div className="flex items-center gap-3 mb-8">
                    <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                       <Award size={20} />
                    </div>
                    <h3 className="text-lg font-black text-slate-800">Sertifikat & Ujian</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 border border-slate-100">
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-800">Sertifikat Kelulusan</p>
                          <p className="text-[9px] text-slate-400 mt-1">Berikan sertifikat otomatis di akhir.</p>
                       </div>
                       <input 
                        type="checkbox" 
                        checked={formData.hasCertificate}
                        onChange={(e) => setFormData({...formData, hasCertificate: e.target.checked})}
                        className="h-6 w-6 accent-[#0B213F] rounded-lg"
                       />
                    </div>
                    <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 border border-slate-100">
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-800">Wajib Ujian Akhir</p>
                          <p className="text-[9px] text-slate-400 mt-1">Siswa harus lulus kuis akhir.</p>
                       </div>
                       <input 
                        type="checkbox" 
                        checked={formData.requireExam}
                        onChange={(e) => setFormData({...formData, requireExam: e.target.checked})}
                        className="h-6 w-6 accent-[#0B213F] rounded-lg"
                       />
                    </div>
                 </div>
              </section>

           </div>
        </div>
      </form>
    </div>
  );
}
