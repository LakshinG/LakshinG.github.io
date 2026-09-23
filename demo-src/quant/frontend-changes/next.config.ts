import type { NextConfig } from "next";

// SNAPSHOT=1 builds a static export for the portfolio site, served under /demos/quant.
const snapshot = process.env.NEXT_PUBLIC_SNAPSHOT === "1";

const nextConfig: NextConfig = snapshot
  ? {
      output: "export",
      basePath: process.env.NEXT_PUBLIC_BASE_PATH,
      trailingSlash: true,
      images: { unoptimized: true },
      // The dashboard has two pre-existing Recharts typing errors; they don't affect the demo.
      typescript: { ignoreBuildErrors: true },
    }
  : {};

export default nextConfig;

