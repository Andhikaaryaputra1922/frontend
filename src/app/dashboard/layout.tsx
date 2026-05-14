import { Sidebar } from "@/features/users/components/layouts/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* 1. Sidebar dipasang di sini */}
      <Sidebar /> 

      {/* 2. Beri margin kiri (pl-64) agar konten tidak tertutup sidebar */}
      <main className="flex-1 pl-64 bg-[var(--base)]">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}