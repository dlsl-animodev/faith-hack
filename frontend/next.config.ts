import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // 'output: standalone' removed — not needed for Vercel deployment
};

export default nextConfig;
