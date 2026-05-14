import { cookies } from "next/headers";
import { getAuthCookieName, verifyUserJwt } from "@/shared/lib/auth/jwt";
import TeacherSidebar from "@/features/users/components/layouts/TeacherSidebar";
import { prisma } from "@/shared/lib/prisma";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value;
  const auth = token ? await verifyUserJwt(token).catch(() => null) : null;

  let userData = null;
  if (auth?.uid) {
    userData = await prisma.user.findUnique({
      where: { id: auth.uid },
      select: { name: true, image: true, role: true }
    });
  }
  
  return (
    <div className="flex min-h-screen bg-[var(--base)]">
      <TeacherSidebar 
        name={userData?.name || "Teacher"} 
        role={userData?.role || "TEACHER"} 
        image={userData?.image || undefined}
      />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}
