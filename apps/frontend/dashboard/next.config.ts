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
