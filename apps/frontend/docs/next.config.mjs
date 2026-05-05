/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  basePath: '/docs',
  output: 'standalone',
  allowedDevOrigins: ['local.reloop.sh', '*.local.reloop.sh'],
  serverExternalPackages: ['next-mdx-remote'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Link',
            value: '</docs/llms.txt>; rel="llms-txt"',
          },
        ],
      },
    ];
  },
};

export default config;
