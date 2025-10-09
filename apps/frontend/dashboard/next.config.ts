import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	basePath: "/dashboard",
	output: "standalone",
	allowedDevOrigins: ["reloop.local", "*.reloop.local"],
	webpack: (config) => {
		// Handle node: protocol imports
		config.resolve.fallback = {
			...config.resolve.fallback,
			fs: false,
			net: false,
			tls: false,
			crypto: false,
		};

		// Externalize node:sqlite
		config.externals = config.externals || [];
		config.externals.push({
			"node:sqlite": "commonjs node:sqlite",
		});

		return config;
	},
};

export default nextConfig;
