import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "*.replit.dev",
    "*.replit.app",
    "*.kirk.replit.dev",
  ],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:3001/api/:path*',
      },
    ];
  },
};

export default nextConfig;
