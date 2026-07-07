import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	allowedDevOrigins: ["local.reloop.sh", "*.local.reloop.sh"],
	cacheComponents: true,
	partialPrefetching: true,
	experimental: {
		turbopackMemoryEviction: false,
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
			{
				source: "/api/analytics/script.js",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=86400, stale-while-revalidate=604800",
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
				source: "/api/analytics/script.js",
				destination: "https://rybbit.reloop.sh/api/script.js",
			},
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
	async redirects() {
		return [
			{
				source: "/features/SDKs",
				destination: "/docs/resources/sdks",
				permanent: true,
			},
			{
				source: "/features/sdks",
				destination: "/docs/resources/sdks",
				permanent: true,
			},
		];
	},
};

export default nextConfig;
