import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Exclude backup directories and Online folder from build
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules',
        '**/.git',
        '**/backup_*',
        '**/Online',
        '**/backup_*/**',
        '**/Online/**',
      ],
    };
    return config;
  },
  // Exclude from TypeScript checking
  typescript: {
    ignoreBuildErrors: false,
  },
  // Exclude from ESLint checking
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
