// import type { NextConfig } from "next";

const nextConfig = {
  /* config options here */
  images: {
      remotePatterns: [new URL('https://img.clerk.com/**')],
  }
};

export default nextConfig;
