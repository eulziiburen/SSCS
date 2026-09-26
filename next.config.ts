import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Tour photos are uploaded through a Server Action. The admin form shrinks them in the
    // browser first, so this is headroom, kept under Vercel's 4.5MB request limit.
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
