import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	basePath: "/dashboard",
	output: "standalone",
	allowedDevOrigins: ["reloop.local", "*.reloop.local"],
};

export default nextConfig;
