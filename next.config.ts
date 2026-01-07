import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "@": "./app",
    },
  },
} as NextConfig & {
  eslint?: {
    dirs?: string[];
    ignoreDuringBuilds?: boolean;
  };
};

export default nextConfig;
