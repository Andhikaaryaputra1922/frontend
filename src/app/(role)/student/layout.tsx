"use client";

import { useEffect, useState } from "react";
import StudentHeader from "@/features/users/components/layouts/StudentHeader";
import StudentSidebar from "@/features/users/components/layouts/StudentSidebar";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [hasActivePackage, setHasActivePackage] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me", { credentials: "include" }).then(r => r.json()),
      fetch("/api/student/my-packages", { credentials: "include" }).then(r => r.json()).catch(() => null),
    ]).then(([meData, pkgData]) => {
      if (meData.user) setUser({ name: meData.user.name, email: meData.user.email });
      setHasActivePackage(pkgData?.hasActivePackage ?? false);
    }).catch(console.error)
    .finally(() => setLoaded(true));
  }, []);

  return (
    <div className="flex min-h-screen bg-[#FDFDFD]">
      <StudentSidebar name={user?.name} email={user?.email} hasActivePackage={loaded ? hasActivePackage : undefined} />
      <div className="flex-1 flex flex-col min-w-0">
        <StudentHeader name={user?.name} />
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
