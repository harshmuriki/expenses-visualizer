import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["lh3.googleusercontent.com"], // Add the hostname here
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
