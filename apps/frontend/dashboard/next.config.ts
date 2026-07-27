import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const appDirectory = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
	basePath: "/dashboard",
	output: "standalone",
	outputFileTracingRoot: path.resolve(appDirectory, "../../.."),
	allowedDevOrigins: ["local.reloop.sh", "*.local.reloop.sh"],
	cacheComponents: true,
	partialPrefetching: true,
	experimental: {
		turbopackMemoryEviction: false,
	},
	async rewrites() {
		if (process.env.NODE_ENV === "development") {
			return [];
		}

		return [
			{
				source: "/api/analytics/script.js",
				destination: "https://rybbit.reloop.sh/api/script.js",
			},
			{
				source: "/api/track",
				destination: "https://rybbit.reloop.sh/api/track",
			},
			{
				source: "/api/site/:path*",
				destination: "https://rybbit.reloop.sh/api/site/:path*",
			},
		];
	},
};

export default nextConfig;
