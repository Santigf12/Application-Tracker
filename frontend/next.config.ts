import type { NextConfig } from "next";

const API_URL = process.env.API_URL;
if (!API_URL) {
  throw new Error("Missing API_URL environment variable");
}

const nextConfig: NextConfig = {
  output: "standalone",
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*/",
        destination: `${API_URL}/api/:path*/`,
      },
      {
        source: "/api/:path*",
        destination: `${API_URL}/api/:path*/`,
      },
    ];
  },
};

export default nextConfig;
