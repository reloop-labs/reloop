import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	basePath: "/console",
	output: "standalone",
	allowedDevOrigins: ["local.reloop.sh", "*.local.reloop.sh"],
	cacheComponents: true,
	partialPrefetching: true,
	experimental: {
		turbopackMemoryEviction: false,
	},
};

export default nextConfig;
