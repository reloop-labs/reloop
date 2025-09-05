import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	basePath: "/dashboard",
	output: "standalone",
	allowedDevOrigins: ["*"],
};

export default nextConfig;
