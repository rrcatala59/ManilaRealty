import type { NextConfig } from "next";

const supabaseHost = (() => {
  try {
    const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    return raw ? new URL(raw).hostname : null;
  } catch {
    return null;
  }
})();

const supabaseStoragePatterns = (hostname: string) =>
  [
    {
      protocol: "https" as const,
      hostname,
      port: "",
      pathname: "/storage/v1/object/public/**",
    },
    {
      protocol: "https" as const,
      hostname,
      port: "",
      pathname: "/storage/v1/render/image/public/**",
    },
  ];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
  images: {
    // Enable modern high-efficiency formats for slower Philippine mobile networks
    formats: ["image/avif", "image/webp"],
    // Protect against image parsing timeouts by caching optimized images at the edge
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        port: "",
        pathname: "/**",
      },
      ...supabaseStoragePatterns("*.supabase.co"),
      ...(supabaseHost ? supabaseStoragePatterns(supabaseHost) : []),
    ],
  },
  // Enforce structural code optimization routines during standard production builds
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
