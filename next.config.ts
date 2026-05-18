import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Esconde o indicador "N" do Next.js DevTools no canto inferior esquerdo —
  // só aparece em dev e atrapalha demos a clientes. Em prod nem renderiza.
  devIndicators: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
    ],
  },
};

export default nextConfig;
