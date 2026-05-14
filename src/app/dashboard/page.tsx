import { cookies } from "next/headers";
import { getAuthCookieName, verifyUserJwt } from "@/shared/lib/auth/jwt";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(getAuthCookieName())?.value;
  if (!token) redirect("/login");

  const auth = await verifyUserJwt(token).catch(() => null);
  if (!auth) redirect("/login");

  if (auth.role === "ADMIN") redirect("/admin");
  if (auth.role === "TEACHER") redirect("/teacher");
  redirect("/student");
}
