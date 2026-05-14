import { cookies } from "next/headers";
import { getAuthCookieName, verifyUserJwt } from "@/shared/lib/auth/jwt";
import AdminSidebar from "@/features/users/components/layouts/AdminSidebar";
import { prisma } from "@/shared/lib/prisma";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value;
  const auth = token ? await verifyUserJwt(token).catch(() => null) : null;

  let userData = null;
  if (auth?.uid) {
    userData = await prisma.user.findUnique({
      where: { id: auth.uid },
      select: { name: true, email: true }
    });
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <AdminSidebar name={userData?.name || "Admin"} email={userData?.email || "admin@haneen.academy"} />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}
