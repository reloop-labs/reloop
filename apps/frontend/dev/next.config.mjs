import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
	reactStrictMode: true,
	basePath: "/dev",
	output: "standalone",
	allowedDevOrigins: ["reloop.local", "*.reloop.local"],
	reactCompiler: true,
};

export default withMDX(config);
