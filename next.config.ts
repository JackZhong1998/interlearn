import type { NextConfig } from "next";

const isExport = process.env.STATIC_EXPORT === "1";
const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: isExport ? "export" : undefined,
  trailingSlash: isExport,
  basePath: base || undefined,
  assetPrefix: base || undefined,
  images: { unoptimized: true },
  experimental: {
    serverActions: { bodySizeLimit: "8mb" },
  },
};

export default nextConfig;
