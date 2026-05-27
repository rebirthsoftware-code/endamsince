import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.0.4'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        // Vercel Blob (eski dosyalar için, migration sonrası kaldırılabilir)
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        // Cloudflare R2 public dev URL
        protocol: 'https',
        hostname: 'pub-5e1f2891b059489d97e0f2ab30fb95c8.r2.dev',
      },
    ],
  },
};

export default nextConfig;
