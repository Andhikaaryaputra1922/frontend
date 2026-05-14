import { Outfit, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/shared/components/ui/theme-provider";
import { Toaster } from "sonner";

import "./globals.css";

/*
========================================
FONT SYSTEM (PREMIUM PAIRING)
========================================
*/

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/*
========================================
ROOT LAYOUT
========================================
*/

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`
        ${outfit.variable}
        ${plusJakartaSans.variable}
        ${geistMono.variable}
        h-full
        antialiased
      `}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--base)] text-[var(--text)]">
        <Script 
          src="https://app.sandbox.midtrans.com/snap/snap.js" 
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} 
          strategy="afterInteractive" 
        />

        <ThemeProvider>

          {/* MAIN CONTENT */}
          <div className="flex-1">
            {children}
          </div>

          {/* GLOBAL TOAST */}
          <Toaster
            richColors
            position="top-right"
            closeButton
            expand
            duration={3000}
            toastOptions={{
              classNames: {
                toast:
                  "rounded-2xl border border-white/10 shadow-2xl",
                title:
                  "font-bold tracking-tight",
                description:
                  "text-sm opacity-90",
              },
            }}
          />

        </ThemeProvider>

      </body>
    </html>
  );
}