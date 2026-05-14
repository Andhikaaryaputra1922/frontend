"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  User, Mail, Phone, Lock, Moon, Sun, Monitor, 
  Camera, LogOut, ChevronRight, ShieldCheck, CreditCard 
} from "lucide-react";
import { useTheme } from "@/shared/components/ui/theme-provider";
import { PremiumModal, Toast } from "@/shared/components/ui/PremiumFeedback";
import ImageCropperModal from "@/shared/components/ui/ImageCropperModal";

interface UserProfile {
  id: string;
  name: string;
  username: string | null;
  email: string;
  phone: string | null;
  image: string | null;
  role: string;
}

interface PackageInfo {
  enrollmentId: string;
  status: string;
  package: { name: string; price: number };
  expiresAt: string | null;
  daysRemaining: number | null;
}

export default function StudentSettingsClient() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // States
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activePackages, setActivePackages] = useState<PackageInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Feedback
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [modal, setModal] = useState<{ isOpen: boolean; type: any; title: string; message: string; onConfirm: () => void } | null>(null);

  // Form States
  const [profileForm, setProfileForm] = useState({ name: "", username: "" });
  const [accountForm, setAccountForm] = useState({ email: "", phone: "" });
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [cropper, setCropper] = useState<{ isOpen: boolean; imageSrc: string }>({ isOpen: false, imageSrc: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [meRes, pkgRes] = await Promise.all([
        fetch("/api/auth/me", { credentials: "include" }),
        fetch("/api/student/my-packages", { credentials: "include" })
      ]);

      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user);
        setProfileForm({ 
          name: meData.user.name || "", 
          username: meData.user.username || "" 
        });
        setAccountForm({
          email: meData.user.email || "",
          phone: meData.user.phone || ""
        });
      }

      if (pkgRes.ok) {
        const pkgData = await pkgRes.json();
        setActivePackages(pkgData.activePackages || []);
      }
    } catch (err) {
      console.error("Failed to fetch settings data:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/users/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileForm.name,
          username: profileForm.username || null,
          phone: accountForm.phone,
          address: user?.address || null,
          dateOfBirth: user?.dateOfBirth || null,
          gender: user?.gender || null,
          school: user?.school || null,
          bio: user?.bio || null,
          image: user?.image || null,
        }),
      });
      if (res.ok) {
        setToast({ message: "Profil berhasil diperbarui", type: "success" });
        fetchData();
      } else {
        const err = await res.json();
        setToast({ message: err.message || "Gagal memperbarui profil", type: "error" });
      }
    } catch {
      setToast({ message: "Terjadi kesalahan", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      setToast({ message: "Password baru tidak cocok", type: "error" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.new,
        }),
      });
      if (res.ok) {
        setToast({ message: "Password berhasil diubah", type: "success" });
        setPasswordForm({ current: "", new: "", confirm: "" });
      } else {
        const err = await res.json();
        setToast({ message: err.message || "Gagal mengubah password", type: "error" });
      }
    } catch {
      setToast({ message: "Terjadi kesalahan", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      router.push("/login");
      router.refresh();
    } catch {
      setToast({ message: "Gagal logout", type: "error" });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCropper({ isOpen: true, imageSrc: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setCropper({ ...cropper, isOpen: false });
    
    // Local preview
    const objectUrl = URL.createObjectURL(croppedBlob);
    setAvatarPreview(objectUrl);

    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", croppedBlob, "profile.jpg");
      
      const res = await fetch("/api/users/me/avatar", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setAvatarPreview(data.url);
        setUser(prev => prev ? { ...prev, image: data.url } : prev);
        setToast({ message: "Foto profil berhasil diperbarui! 🎉", type: "success" });
      } else {
        const err = await res.json();
        setAvatarPreview(null);
        setToast({ message: err.message || "Gagal upload foto", type: "error" });
      }
    } catch {
      setAvatarPreview(null);
      setToast({ message: "Terjadi kesalahan saat upload", type: "error" });
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!mounted || loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#8B0000] border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      {/* Toast & Modal */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ImageCropperModal 
        isOpen={cropper.isOpen}
        imageSrc={cropper.imageSrc}
        onClose={() => setCropper({ ...cropper, isOpen: false })}
        onCropComplete={handleCropComplete}
      />
      {modal && (
        <PremiumModal 
          isOpen={modal.isOpen} 
          onClose={() => setModal(null)} 
          onConfirm={modal.onConfirm}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          confirmText="Ya, Lanjutkan"
          loading={saving}
        />
      )}

      {/* Profile Section */}
      <section className="overflow-hidden rounded-[40px] border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="h-32 bg-gradient-to-r from-[#8B0000] to-red-900" />
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6 flex items-end justify-between">
            <div className="relative group">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <div className="h-32 w-32 rounded-[32px] border-4 border-[var(--surface)] bg-slate-100 flex items-center justify-center overflow-hidden shadow-xl">
                {avatarUploading ? (
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#8B0000] border-t-transparent" />
                ) : (avatarPreview || user?.image) ? (
                  <img src={avatarPreview || user?.image || ""} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User size={64} className="text-slate-300" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="absolute bottom-2 right-2 h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#8B0000] shadow-lg group-hover:scale-110 transition-transform disabled:opacity-50"
              >
                {avatarUploading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#8B0000] border-t-transparent" /> : <Camera size={20} />}
              </button>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleUpdateProfile}
                disabled={saving}
                className="rounded-2xl bg-[#8B0000] px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-red-900/20 hover:bg-red-800 transition active:scale-95 disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan Profil"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-[var(--muted)] px-1">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                <input 
                  value={profileForm.name}
                  onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--base)] py-4 pl-12 pr-4 text-sm font-bold text-[var(--text)] focus:border-[#8B0000] focus:outline-none transition-all" 
                  placeholder="Masukkan nama lengkap"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-[var(--muted)] px-1">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[var(--muted)]">@</span>
                <input 
                  value={profileForm.username}
                  onChange={e => setProfileForm({...profileForm, username: e.target.value})}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--base)] py-4 pl-10 pr-4 text-sm font-bold text-[var(--text)] focus:border-[#8B0000] focus:outline-none transition-all" 
                  placeholder="username_kamu"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Section */}
      <section className="rounded-[40px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-inner">
            <CreditCard size={20} />
          </div>
          <h2 className="text-xl font-black tracking-tight text-[var(--text)]">Membership & Paket</h2>
        </div>
        
        {activePackages.length > 0 ? (
          <div className="grid gap-4">
            {activePackages.map(pkg => (
              <div key={pkg.enrollmentId} className="flex items-center justify-between p-5 rounded-3xl bg-gradient-to-br from-amber-50/50 to-white border border-amber-100 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-amber-400/10 flex items-center justify-center text-2xl">💎</div>
                  <div>
                    <p className="font-black text-slate-800 text-base">Paket {pkg.package.name}</p>
                    <p className="text-xs text-slate-500 font-medium">
                      {pkg.expiresAt ? `Berakhir: ${new Date(pkg.expiresAt).toLocaleDateString("id-ID")}` : "Akses Selamanya"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-amber-700">{pkg.daysRemaining} Hari Lagi</p>
                  <button className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-[#8B0000] transition mt-1">Perpanjang →</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 rounded-[32px] border-2 border-dashed border-[var(--border)] text-center">
            <p className="text-sm text-[var(--muted)] font-medium">Kamu belum berlangganan paket materi premium.</p>
            <button 
              onClick={() => router.push("/student/packages")}
              className="mt-4 text-xs font-black text-[#8B0000] hover:underline"
            >
              Lihat Pilihan Paket
            </button>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Account Settings */}
        <section className="rounded-[40px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm h-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
              <ShieldCheck size={20} />
            </div>
            <h2 className="text-xl font-black tracking-tight text-[var(--text)]">Akun & Kontak</h2>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-[var(--muted)] px-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                <input 
                  disabled
                  value={accountForm.email}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--base)]/50 py-4 pl-12 pr-4 text-sm font-bold text-[var(--text)] opacity-60 cursor-not-allowed" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-[var(--muted)] px-1">Nomor WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                <input 
                  value={accountForm.phone}
                  onChange={e => setAccountForm({...accountForm, phone: e.target.value})}
                  className="w-full rounded-2xl border border-[var(--border)] bg-[var(--base)] py-4 pl-12 pr-4 text-sm font-bold text-[var(--text)] focus:border-[#8B0000] focus:outline-none transition-all" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* Security Settings */}
        <section className="rounded-[40px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm h-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-inner">
              <Lock size={20} />
            </div>
            <h2 className="text-xl font-black tracking-tight text-[var(--text)]">Ganti Password</h2>
          </div>
          
          <div className="space-y-4">
            <input 
              type="password"
              value={passwordForm.current}
              onChange={e => setPasswordForm({...passwordForm, current: e.target.value})}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--base)] py-4 px-5 text-sm font-bold text-[var(--text)] focus:border-[#8B0000] focus:outline-none transition-all" 
              placeholder="Password saat ini"
            />
            <input 
              type="password"
              value={passwordForm.new}
              onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--base)] py-4 px-5 text-sm font-bold text-[var(--text)] focus:border-[#8B0000] focus:outline-none transition-all" 
              placeholder="Password baru"
            />
            <input 
              type="password"
              value={passwordForm.confirm}
              onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--base)] py-4 px-5 text-sm font-bold text-[var(--text)] focus:border-[#8B0000] focus:outline-none transition-all" 
              placeholder="Konfirmasi password baru"
            />
            <button 
              onClick={handleChangePassword}
              disabled={saving}
              className="w-full mt-2 rounded-2xl bg-slate-900 py-4 text-sm font-black text-white hover:bg-black transition active:scale-95 disabled:opacity-50 shadow-lg"
            >
              Update Password
            </button>
          </div>
        </section>
      </div>

      {/* App Appearance */}
      <section className="rounded-[40px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 shadow-inner">
            <Monitor size={20} />
          </div>
          <h2 className="text-xl font-black tracking-tight text-[var(--text)]">Tampilan Dashboard</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { key: "light", title: "Mode Terang", icon: <Sun size={20} />, desc: "Cerah & bersih" },
            { key: "dark", title: "Mode Malam", icon: <Moon size={20} />, desc: "Nyaman untuk mata" },
            { key: "system", title: "Sistem", icon: <Monitor size={20} />, desc: "Ikuti perangkat" },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setTheme(item.key as any)}
              className={`p-5 rounded-[28px] border-2 text-left transition-all ${
                theme === item.key 
                ? "border-[#8B0000] bg-red-50/10" 
                : "border-[var(--border)] bg-[var(--base)]/50 hover:bg-black/5"
              }`}
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${theme === item.key ? 'bg-[#8B0000] text-white' : 'bg-slate-100 text-slate-500'}`}>
                {item.icon}
              </div>
              <p className="font-black text-sm text-[var(--text)]">{item.title}</p>
              <p className="text-xs text-[var(--muted)] mt-1 font-medium">{item.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Danger Zone */}
      <div className="pt-10 flex items-center justify-center">
        <button 
          onClick={() => setModal({
            isOpen: true,
            type: "logout",
            title: "Konfirmasi Keluar",
            message: "Yakin ingin keluar dari akun Haneen Academy?",
            onConfirm: handleLogout
          })}
          className="flex items-center gap-3 px-10 py-4 rounded-3xl border-2 border-rose-100 text-rose-600 font-black hover:bg-rose-50 transition active:scale-95 shadow-sm"
        >
          <LogOut size={20} />
          <span>Keluar Akun</span>
        </button>
      </div>
    </div>
  );
}
