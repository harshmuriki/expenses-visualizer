import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["lh3.googleusercontent.com"], // Add the hostname here
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // Material Web components use Web Components which need special handling
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
    };
    return config;
  },
  transpilePackages: ['@material/web'],
};

export default nextConfig;
