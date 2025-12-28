import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "@": "./app",
    },
  },
};

export default nextConfig;
