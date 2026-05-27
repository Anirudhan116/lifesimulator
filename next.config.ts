import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/lifesimulator',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
