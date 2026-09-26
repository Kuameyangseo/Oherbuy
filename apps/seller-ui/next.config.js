//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: {},
  allowedDevOrigins: ['192.168.100.79'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        // allow any path under the ImageKit host
        pathname: '/:path*',
      }
    ]
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'jotai$': require.resolve('jotai'),
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8080/api/:path*',
      },
      {
        source: '/product/:path*',
        destination: 'http://127.0.0.1:8080/product/:path*',
      },
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

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
