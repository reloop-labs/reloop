import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	basePath: "/console",
	output: "standalone",
	allowedDevOrigins: ["local.reloop.sh", "*.local.reloop.sh"],
	cacheComponents: true,
	async headers() {
		return [
			{
				// Block clickjacking: only our own origin may frame these pages
				source: "/:path*",
				headers: [
					{ key: "X-Frame-Options", value: "SAMEORIGIN" },
					{ key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
				],
			},
		];
	},
};

export default nextConfig;
