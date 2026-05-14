"use client";

export default function LogoutButton() {
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/login";
      }}
      className="rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white hover:bg-red-600 transition"
    >
      Logout
    </button>
  );
}
