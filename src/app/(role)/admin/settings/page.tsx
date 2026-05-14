"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PremiumModal, Toast } from "@/shared/components/ui/PremiumFeedback";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    image: "",
  });

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/users/me", { credentials: "include" });
      if (res.ok) {
        const d = await res.json();
        if (d.user) {
          setFormData({
            name: d.user.name || "",
            email: d.user.email || "",
            phone: d.user.phone || "",
            bio: d.user.bio || "",
            image: d.user.image || "",
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("avatar", file);

    setSaving(true);
    try {
      const res = await fetch("/api/users/me/avatar", {
        method: "POST",
        credentials: "include",
        body: formDataUpload,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, image: data.url }));
        setToast({ message: "Foto profil admin berhasil diperbarui!", type: "success" });
        router.refresh();
      } else {
        const err = await res.json();
        setToast({ message: err.message || "Gagal mengunggah foto", type: "error" });
      }
    } catch {
      setToast({ message: "Kesalahan jaringan", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          bio: formData.bio,
        }),
      });

      if (res.ok) {
        setToast({ message: "Profil admin berhasil disimpan!", type: "success" });
        fetchProfile();
      } else {
        const err = await res.json();
        setToast({ message: err.message || "Gagal menyimpan profil", type: "error" });
      }
    } catch {
      setToast({ message: "Kesalahan jaringan", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC] p-8 flex items-center justify-center">
        <p className="text-sm font-black uppercase tracking-widest text-slate-300">Synchronizing Administrator...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-6 md:p-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="h-1 w-10 bg-[#E5B54F] rounded-full" />
            <p className="text-[10px] font-black text-[#E5B54F] uppercase tracking-[0.3em]">System Authority</p>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-[#1A2E44]">Admin Settings</h1>
        </div>

        <div className="rounded-[40px] border border-slate-200 bg-white p-8 md:p-12 shadow-sm border-b-8 border-b-[#1A2E44]/10">
          <form onSubmit={handleSave} className="space-y-8">
            
            {/* Admin Avatar Section */}
            <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-slate-100">
              <div className="relative group cursor-pointer" onClick={() => document.getElementById('admin-avatar-upload')?.click()}>
                <div className="h-32 w-32 rounded-[40px] bg-[#1A2E44] border-4 border-[#E5B54F]/20 overflow-hidden shadow-xl group-hover:scale-105 transition-all duration-500 relative">
                  {formData.image ? (
                    <img src={formData.image} alt="Admin" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-4xl font-black text-[#E5B54F]">
                      {formData.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-[#1A2E44] rounded-2xl flex items-center justify-center shadow-lg border-4 border-white text-[#E5B54F]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                </div>
                <input 
                  id="admin-avatar-upload"
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <div className="flex-1 space-y-2 text-center md:text-left">
                <h3 className="text-xl font-black text-[#1A2E44]">Administrator Identity</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">Update your public presence within the Haneen Academy system.</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1A2E44]/5 border border-[#1A2E44]/10 text-[9px] font-black text-[#1A2E44] uppercase tracking-widest">
                  Secure File Storage Active
                </div>
              </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Admin Name</label>
                <input 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-black text-[#1A2E44] focus:ring-2 focus:ring-[#E5B54F]/20 focus:border-[#E5B54F] focus:bg-white outline-none transition-all" 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">System Email</label>
                <input 
                  disabled 
                  value={formData.email} 
                  className="w-full rounded-2xl border border-slate-100 bg-slate-100 px-5 py-4 text-sm font-bold text-slate-400 outline-none cursor-not-allowed" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Contact Phone</label>
              <input 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="+62..."
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-black text-[#1A2E44] focus:ring-2 focus:ring-[#E5B54F]/20 focus:border-[#E5B54F] focus:bg-white outline-none transition-all" 
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Administrative Bio</label>
              <textarea 
                value={formData.bio} 
                onChange={e => setFormData({...formData, bio: e.target.value})}
                rows={4}
                placeholder="Describe your administrative role or focus..."
                className="w-full rounded-3xl border border-slate-100 bg-slate-50 px-5 py-5 text-sm font-bold text-[#1A2E44] focus:ring-2 focus:ring-[#E5B54F]/20 focus:border-[#E5B54F] focus:bg-white outline-none transition-all resize-none"
              ></textarea>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={saving}
                className="w-full rounded-3xl bg-[#1A2E44] py-5 text-xs font-black uppercase tracking-[0.3em] text-[#E5B54F] shadow-xl shadow-[#1A2E44]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {saving ? "Updating Authority..." : "Update System Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </main>
  );
}
