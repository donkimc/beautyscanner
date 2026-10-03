import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Database drivers are loaded at runtime on the server only.
  serverExternalPackages: ["pg", "@electric-sql/pglite"],
};

export default nextConfig;
