// import type { NextConfig } from "next";

const nextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
      remotePatterns: [new URL('https://img.clerk.com/**')],
  }
};

export default nextConfig;
