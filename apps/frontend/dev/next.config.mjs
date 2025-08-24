import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();
const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const config = {
	reactStrictMode: true,
	assetPrefix: isProd ? "/dev" : undefined,
	trailingSlash: true,
};

export default withMDX(config);
