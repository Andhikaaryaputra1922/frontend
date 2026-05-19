"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  User, Mail, Phone, Lock, Moon, Sun, Monitor, 
  Camera, LogOut, ShieldCheck, CreditCard, Palette 
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
  address: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  school: string | null;
  bio: string | null;
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
        setToast({ message: "Foto profil berhasil diperbarui!", type: "success" });
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

  // --- Shared Styles ---
  const inputClass = "w-full rounded-xl border border-[var(--border)] bg-[var(--base)] py-3.5 px-4 text-sm font-semibold text-[var(--text)] placeholder:text-[var(--muted)]/60 focus:border-[#0B213F] focus:outline-none focus:ring-2 focus:ring-[#0B213F]/10 transition-all";
  const labelClass = "block text-[10px] font-black uppercase tracking-[0.15em] text-[var(--muted)] mb-2";
  const sectionClass = "rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8";

  if (!mounted || loading) return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#0B213F] border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
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

      {/* ═══════════════════════════════════════ */}
      {/* PROFILE CARD                            */}
      {/* ═══════════════════════════════════════ */}
      <section className={sectionClass}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
          {/* Avatar */}
          <div className="relative group shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <div className="h-20 w-20 rounded-2xl bg-[#0B213F]/5 border border-[var(--border)] flex items-center justify-center overflow-hidden">
              {avatarUploading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0B213F] border-t-transparent" />
              ) : (avatarPreview || user?.image) ? (
                <img src={avatarPreview || user?.image || ""} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <User size={32} className="text-[var(--muted)]" strokeWidth={1.5} />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-1 -right-1 h-7 w-7 rounded-lg bg-[#0B213F] flex items-center justify-center text-white shadow-md hover:bg-[#0d2847] transition disabled:opacity-50"
            >
              <Camera size={13} />
            </button>
          </div>

          {/* Name + role */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black tracking-tight text-[var(--text)] truncate">{user?.name || "—"}</h2>
            <p className="text-xs font-semibold text-[var(--muted)] mt-0.5">{user?.email}</p>
          </div>

          {/* Save button */}
          <button 
            onClick={handleUpdateProfile}
            disabled={saving}
            className="shrink-0 rounded-xl bg-[#0B213F] px-6 py-2.5 text-xs font-black text-white hover:bg-[#0d2847] transition active:scale-[0.97] disabled:opacity-50 shadow-sm"
          >
            {saving ? "Menyimpan..." : "Simpan Profil"}
          </button>
        </div>

        {/* Profile fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Nama Lengkap</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} strokeWidth={1.5} />
              <input 
                value={profileForm.name}
                onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                className={inputClass}
                style={{ paddingLeft: "40px" }}
                placeholder="Masukkan nama lengkap"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Username</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[var(--muted)]">@</span>
              <input 
                value={profileForm.username}
                onChange={e => setProfileForm({...profileForm, username: e.target.value})}
                className={inputClass}
                style={{ paddingLeft: "32px" }}
                placeholder="username_kamu"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* MEMBERSHIP                              */}
      {/* ═══════════════════════════════════════ */}
      <section className={sectionClass}>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-9 w-9 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
            <CreditCard size={18} />
          </div>
          <h2 className="text-base font-black tracking-tight text-[var(--text)]">Membership & Paket</h2>
        </div>
        
        {activePackages.length > 0 ? (
          <div className="grid gap-3">
            {activePackages.map(pkg => (
              <div key={pkg.enrollmentId} className="flex items-center justify-between p-4 rounded-xl bg-[#D4AF37]/5 border border-[#D4AF37]/15">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] shrink-0 text-lg font-black">
                    ✦
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-sm text-[var(--text)] truncate">Paket {pkg.package.name}</p>
                    <p className="text-[11px] text-[var(--muted)] font-medium">
                      {pkg.expiresAt ? `Berakhir: ${new Date(pkg.expiresAt).toLocaleDateString("id-ID")}` : "Akses Selamanya"}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-xs font-black text-[#D4AF37]">{pkg.daysRemaining} Hari</p>
                  <button 
                    onClick={() => router.push("/student/packages")}
                    className="text-[9px] font-black uppercase tracking-wider text-[var(--muted)] hover:text-[#0B213F] transition mt-0.5"
                  >
                    Perpanjang →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-xl border border-dashed border-[var(--border)] text-center">
            <p className="text-sm text-[var(--muted)] font-medium">Belum ada paket aktif</p>
            <button 
              onClick={() => router.push("/student/packages")}
              className="mt-3 text-xs font-black text-[#0B213F] hover:text-[#D4AF37] transition"
            >
              Lihat Pilihan Paket →
            </button>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* ACCOUNT & SECURITY — Side by side       */}
      {/* ═══════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account */}
        <section className={sectionClass}>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-xl bg-[#0B213F]/5 flex items-center justify-center text-[#0B213F]">
              <ShieldCheck size={18} />
            </div>
            <h2 className="text-base font-black tracking-tight text-[var(--text)]">Akun & Kontak</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} strokeWidth={1.5} />
                <input 
                  disabled
                  value={accountForm.email}
                  className={`${inputClass} opacity-50 cursor-not-allowed`}
                  style={{ paddingLeft: "40px" }}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Nomor WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} strokeWidth={1.5} />
                <input 
                  value={accountForm.phone}
                  onChange={e => setAccountForm({...accountForm, phone: e.target.value})}
                  className={inputClass}
                  style={{ paddingLeft: "40px" }}
                  placeholder="08xx-xxxx-xxxx"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className={sectionClass}>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-9 w-9 rounded-xl bg-[#0B213F]/5 flex items-center justify-center text-[#0B213F]">
              <Lock size={18} />
            </div>
            <h2 className="text-base font-black tracking-tight text-[var(--text)]">Ganti Password</h2>
          </div>
          
          <div className="space-y-3">
            <input 
              type="password"
              value={passwordForm.current}
              onChange={e => setPasswordForm({...passwordForm, current: e.target.value})}
              className={inputClass}
              placeholder="Password saat ini"
            />
            <input 
              type="password"
              value={passwordForm.new}
              onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}
              className={inputClass}
              placeholder="Password baru"
            />
            <input 
              type="password"
              value={passwordForm.confirm}
              onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
              className={inputClass}
              placeholder="Konfirmasi password baru"
            />
            <button 
              onClick={handleChangePassword}
              disabled={saving}
              className="w-full mt-1 rounded-xl bg-[#0B213F] py-3.5 text-xs font-black text-white hover:bg-[#0d2847] transition active:scale-[0.97] disabled:opacity-50"
            >
              Update Password
            </button>
          </div>
        </section>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* APPEARANCE                              */}
      {/* ═══════════════════════════════════════ */}
      <section className={sectionClass}>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-9 w-9 rounded-xl bg-[#0B213F]/5 flex items-center justify-center text-[#0B213F]">
            <Palette size={18} />
          </div>
          <h2 className="text-base font-black tracking-tight text-[var(--text)]">Tampilan</h2>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: "light", title: "Terang", icon: <Sun size={18} />, desc: "Cerah & bersih" },
            { key: "dark", title: "Gelap", icon: <Moon size={18} />, desc: "Nyaman di malam hari" },
            { key: "system", title: "Sistem", icon: <Monitor size={18} />, desc: "Ikuti perangkat" },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setTheme(item.key as any)}
              className={`p-4 rounded-xl border text-left transition-all ${
                theme === item.key 
                ? "border-[#0B213F] bg-[#0B213F]/5 ring-1 ring-[#0B213F]/10" 
                : "border-[var(--border)] hover:border-[#0B213F]/20 hover:bg-[#0B213F]/[0.02]"
              }`}
            >
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center mb-2.5 ${theme === item.key ? 'bg-[#0B213F] text-white' : 'bg-[var(--base)] text-[var(--muted)] border border-[var(--border)]'}`}>
                {item.icon}
              </div>
              <p className="font-black text-xs text-[var(--text)]">{item.title}</p>
              <p className="text-[10px] text-[var(--muted)] mt-0.5 font-medium">{item.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════ */}
      {/* LOGOUT                                  */}
      {/* ═══════════════════════════════════════ */}
      <div className="flex justify-center pt-4">
        <button 
          onClick={() => setModal({
            isOpen: true,
            type: "logout",
            title: "Konfirmasi Keluar",
            message: "Yakin ingin keluar dari akun Haneen Academy?",
            onConfirm: handleLogout
          })}
          className="flex items-center gap-2.5 px-8 py-3 rounded-xl border border-rose-200 text-rose-600 text-xs font-black hover:bg-rose-50 transition active:scale-[0.97]"
        >
          <LogOut size={16} />
          Keluar Akun
        </button>
      </div>
    </div>
  );
}
