import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
	reactStrictMode: true,
	basePath: "/dev",
	assetPrefix: "/dev",
	trailingSlash: true,
};

export default withMDX(config);
