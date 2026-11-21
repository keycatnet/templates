import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The catalog and product pages prerender; only the cart and the order page,
  // which read cookies, stream in at request time.
  cacheComponents: true,
  // Link prefetches fetch only static shells, never cookie-backed cart or order data.
  partialPrefetching: true,
  poweredByHeader: false,
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "X-Frame-Options", value: "DENY" },
      ],
    }];
  },
};

export default nextConfig;
