import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize dev server performance
  experimental: {
    // Optimize package imports for faster builds
    optimizePackageImports: ['lucide-react', '@gsap/react'],
  },
  // Explicitly configure Turbopack (empty config to silence warning)
  turbopack: {},
};

export default nextConfig;
