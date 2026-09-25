//@ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep production builds separate from the PM2 development server cache.
  distDir: process.env.NODE_ENV === 'production' ? '.next-prod' : '.next',
  allowedDevOrigins: ['192.168.56.1', '192.168.43.79', 'localhost'],
  // Allow rewrites so we can proxy specific frontend routes to the API backend
  // This uses NEXT_PUBLIC_API_URL at build/dev time. If you prefer env files,
  // set `NEXT_PUBLIC_API_URL` in `apps/user-ui/.env.local`.
  async rewrites() {
    const api = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SERVER_URI || 'http://localhost:8080';
    return [
      // Proxy API endpoints under /api to the backend (convenience for fetch/axios paths)
      { source: '/api/:path*', destination: `${api}/api/:path*` },
      // Proxy frontend `/orders` fetches to backend `/orders` endpoint
      { source: '/orders', destination: `${api}/orders` },
      // Support nested paths if any
      { source: '/orders/:path*', destination: `${api}/orders/:path*` },
    ];
  },
  devIndicators: {
    // Show a development indicator in the browser console
    // @ts-ignore
    auto: false,
  },
  supportmeta: {
    // Show a development indicator in the browser console
    // @ts-ignore
    auto: false,
  },
};

module.exports = nextConfig;
