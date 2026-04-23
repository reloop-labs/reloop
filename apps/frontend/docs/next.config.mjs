/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  basePath: '/docs',
  output: 'standalone',
  allowedDevOrigins: ['local.reloop.sh', '*.local.reloop.sh'],
};

export default config;
