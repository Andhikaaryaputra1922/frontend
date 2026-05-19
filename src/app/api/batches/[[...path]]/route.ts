import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

async function proxy(request: Request, params: { path?: string[] }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("lms_token")?.value;
  const { searchParams } = new URL(request.url);

  const subPath = params.path ? `/${params.path.join("/")}` : "";
  const url = `${BACKEND}/api/batches${subPath}?${searchParams.toString()}`;

  const headers: Record<string, string> = {};
  if (token) headers["Cookie"] = `lms_token=${token}`;

  let body: BodyInit | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    const ct = request.headers.get("content-type") ?? "";
    if (ct.includes("multipart/form-data")) {
      body = await request.formData();
    } else {
      body = await request.text();
      headers["Content-Type"] = "application/json";
    }
  }

  try {
    const res = await fetch(url, { method: request.method, headers, body });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  return proxy(request, await params);
}
export async function POST(request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  return proxy(request, await params);
}
export async function PATCH(request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  return proxy(request, await params);
}
export async function DELETE(request: Request, { params }: { params: Promise<{ path?: string[] }> }) {
  return proxy(request, await params);
}
