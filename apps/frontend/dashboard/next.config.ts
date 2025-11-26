import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	basePath: "/dashboard",
	output: "standalone",
	allowedDevOrigins: ["local.reloop.sh", "*.local.reloop.sh"],
};

export default nextConfig;
