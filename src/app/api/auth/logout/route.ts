import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  // Cookie ini dibuat oleh backend (Express) dengan path "/".
  // Untuk memastikan terhapus di semua browser, set ulang dengan maxAge 0 + path "/".
  response.cookies.set({
    name: "lms_token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
