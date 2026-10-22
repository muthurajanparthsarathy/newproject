import type { NextConfig } from "next";
import path from "node:path";

/** Security headers applied to every response. */
const SECURITY_HEADERS = [
  // Disable MIME sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Allow embedding in same-origin only
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Modern referrer policy: send origin only on cross-origin
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Lock down dangerous browser APIs we never use
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // HSTS — instruct browsers to use HTTPS only (1 year, includeSubDomains)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Cross-origin opener policy — protects against tab-napping
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework
  poweredByHeader: false,
  // Enable gzip/brotli on the Next.js Node server (Vercel does this for you,
  // but this is helpful for self-hosted deployments)
  compress: true,
  // React strict mode catches subtle bugs in development
  reactStrictMode: true,
  // Tell Turbopack the project root explicitly so it doesn't get confused
  // by parent lockfiles in monorepos
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Blog pages re-read content/blog/*.md when they revalidate on the server,
  // so the Markdown files must ship with those routes
  outputFileTracingIncludes: {
    "/blog": ["./content/blog/**/*"],
    "/blog/*": ["./content/blog/**/*"],
    "/sitemap.xml": ["./content/blog/**/*"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
    ],
    // Modern formats for smaller payloads
    formats: ["image/avif", "image/webp"],
    // Cache transformed images on the edge for 30 days
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    // Next.js already long-caches /_next/static/* by default — we only need to
    // bolt on the security headers here.
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
