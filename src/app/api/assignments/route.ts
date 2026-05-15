import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

// Semua request ke /api/assignments diteruskan ke Express backend
export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("lms_token")?.value;
  const { searchParams } = new URL(request.url);

  const res = await fetch(
    `${BACKEND}/api/assignments?${searchParams.toString()}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Cookie: `lms_token=${token}` } : {}),
      },
    }
  );
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("lms_token")?.value;

  // Cek apakah multipart form (ada file upload) atau JSON
  const contentType = request.headers.get("content-type") ?? "";

  let body: BodyInit;
  let headers: Record<string, string> = {};
  if (token) headers["Cookie"] = `lms_token=${token}`;

  if (contentType.includes("multipart/form-data")) {
    body = await request.formData();
    // Jangan set Content-Type — biarkan browser set boundary secara otomatis
  } else {
    body = await request.text();
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BACKEND}/api/assignments`, {
    method: "POST",
    headers,
    body,
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}