import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  outputFileTracingIncludes: {
    "/api/**/*": ["./prisma/seed_template.db", "./prisma/pep_hospitalar.db"],
  },
};

export default nextConfig;
