import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@react-oauth/google", "framer-motion", "lucide-react"],
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
      {
        protocol: process.env.NEXT_PUBLIC_API_URL?.startsWith('https') ? 'https' : 'http',
        hostname: process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/^https?:\/\//, '').split(':')[0] : 'localhost',
        port: process.env.NEXT_PUBLIC_API_URL ? (process.env.NEXT_PUBLIC_API_URL.split(':')[2] || '') : '4000',
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
