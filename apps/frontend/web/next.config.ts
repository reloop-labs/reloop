import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	serverExternalPackages: ["next-mdx-remote", "next-mdx-remote/rsc"],
	output: "standalone",
	allowedDevOrigins: ["local.reloop.sh", "*.local.reloop.sh"],
	cacheComponents: true,
	experimental: {
		inlineCss: true,
	},
	async headers() {
		return [
			{
				source: "/manifest.json",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
		];
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
		],
	},
	async rewrites() {
		return [
			{
				source: "/api/analytics/track",
				destination: "https://rybbit.reloop.sh/api/track",
			},
			{
				source: "/api/analytics/site/:path*",
				destination: "https://rybbit.reloop.sh/api/site/:path*",
			},
		];
	},
};

export default nextConfig;
