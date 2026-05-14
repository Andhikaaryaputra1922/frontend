import React, { useState, useEffect } from "react";

export default function WaktuOperasional() {
  // State untuk menyimpan waktu saat ini
  const [waktuSekarang, setWaktuSekarang] = useState(new Date());
  // State untuk format waktu: 24 jam atau 12 jam
  const [formatWaktu, setFormatWaktu] = useState<"24-jam" | "12-jam">("24-jam");

  // Update waktu setiap detik agar real-time
  useEffect(() => {
    const interval = setInterval(() => {
      setWaktuSekarang(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fungsi format waktu sesuai pilihan pengguna
  const formatJam = (date: Date) => {
    return date.toLocaleTimeString("id-ID", {
      hour12: formatWaktu === "12-jam",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Format tanggal lengkap dengan hari dan bulan dalam bahasa Indonesia
  const formatTanggal = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Zona waktu (hardcoded UTC, bisa dikembangkan untuk dinamis)
  const zonaWaktu = "UTC";

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-center p-6">
      <section className="bg-white shadow-lg rounded-3xl p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-extrabold text-blue-700 mb-4">
          Waktu Operasional Saat Ini
        </h1>

        <p className="text-lg text-gray-600 mb-1">{formatTanggal(waktuSekarang)}</p>

        <p className="text-6xl font-mono font-bold text-gray-900 mb-2 animate-pulse">
          {formatJam(waktuSekarang)}
        </p>

        <p className="text-sm text-gray-500 mb-6">Zona Waktu: {zonaWaktu}</p>

        <button
          onClick={() =>
            setFormatWaktu((prev) => (prev === "24-jam" ? "12-jam" : "24-jam"))
          }
          className="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition"
          aria-label="Ubah format waktu"
          title="Klik untuk mengubah format waktu antara 24 jam dan 12 jam"
        >
          Ubah ke format {formatWaktu === "24-jam" ? "12 jam" : "24 jam"}
        </button>

        <p className="mt-6 text-gray-700 text-sm">
          Selalu perhatikan waktu operasional agar aktivitas Anda berjalan lancar.
        </p>
      </section>
    </main>
  );
}
