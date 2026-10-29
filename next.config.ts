import type { NextConfig } from "next";

// Where the Spring Boot API runs. Set BACKEND_URL in .env.local (dev) or in the hosting dashboard (prod).
const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Proxy: the browser calls /api/... on this site, Next.js forwards it to Spring Boot.
  // Same origin for the browser = the SameSite=Strict refresh cookie works and no CORS is needed.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;