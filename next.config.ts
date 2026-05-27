import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/lifesimulator',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
