import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthCookieName } from "@/lib/auth/jwt";

function parseJwtPayload(token: string) {
  try {
    const base64 = token.split(".")[1];
    const json = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(json) as { role: string; uid: string; exp: number };
  } catch {
    return null;
  }
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(getAuthCookieName())?.value;

  // Sudah login, coba akses /login atau /
  if (token && (pathname === "/login" || pathname === "/")) {
    const payload = parseJwtPayload(token);
    if (payload?.role === "TEACHER" || payload?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/teacher", req.url));
    }
    return NextResponse.redirect(new URL("/student", req.url));
  }

  // Belum login, coba akses halaman protected
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/student") ||
    pathname.startsWith("/teacher") ||
    pathname.startsWith("/admin");

  if (!token && isProtected) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Sudah login, cek role
  if (token && isProtected) {
    const payload = parseJwtPayload(token);
    if (!payload || payload.exp * 1000 < Date.now()) {
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.delete(getAuthCookieName());
      return res;
    }

    // Siswa coba akses /teacher
    if (pathname.startsWith("/teacher") && payload.role === "STUDENT") {
      return NextResponse.redirect(new URL("/student", req.url));
    }

    // Teacher coba akses /student
    if (pathname.startsWith("/student") && (payload.role === "TEACHER" || payload.role === "ADMIN")) {
      return NextResponse.redirect(new URL("/teacher", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
    "/student/:path*",
    "/teacher/:path*",
    "/admin/:path*",
  ],
};
