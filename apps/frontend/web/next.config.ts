import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	allowedDevOrigins: ["reloop.local", "*.reloop.local"],
	reactCompiler: true,
};

export default nextConfig;
