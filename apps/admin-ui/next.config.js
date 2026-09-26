// @ts-check

const { composePlugins, withNx } = require('@nx/next')

/** @type {import('@nx/next/plugins/with-nx').WithNxOptions} */
const nextConfig = {
  nx: {},
  allowedDevOrigins: ['192.168.100.79'],
  async rewrites() {
    return [
      { source: '/admin/:path*', destination: 'http://127.0.0.1:8080/admin/:path*' },
    ]
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
}

module.exports = composePlugins(withNx)(nextConfig)
