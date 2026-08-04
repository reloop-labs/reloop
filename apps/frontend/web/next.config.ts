import type { NextConfig } from "next";

const agentLink =
	'</llms.txt>; rel="llms-txt", </llms-docs.txt>; rel="docs-llms-txt", </llms-full.txt>; rel="llms-full-txt", </llms-full-docs.txt>; rel="docs-llms-full-txt", </sitemap.md>; rel="sitemap", </skill.md>; rel="skill-md"';
const agentCache = "public, max-age=300, s-maxage=3600, must-revalidate";

const nextConfig: NextConfig = {
	serverExternalPackages: ["next-mdx-remote", "next-mdx-remote/rsc"],
	output: "standalone",
	allowedDevOrigins: ["local.reloop.sh", "*.local.reloop.sh"],
	cacheComponents: true,
	experimental: {
		inlineCss: true,
	},
	async headers() {
		const isDev = process.env.NODE_ENV === "development";
		return [
			...(isDev
				? []
				: [
						{
							source: "/_next/static/:path*",
							headers: [
								{
									key: "Cache-Control",
									value: "public, max-age=31536000, immutable",
								},
							],
						},
						{
							source: "/font/:path*",
							headers: [
								{
									key: "Cache-Control",
									value: "public, max-age=31536000, immutable",
								},
							],
						},
					]),
			{
				source: "/manifest.json",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=31536000, immutable",
					},
				],
			},
			{
				// Marketing HTML + agent routes — short cache for AFDocs cache hygiene
				source: "/:path((?!_next/static|_next/image|font/|manifest\\.json).*)",
				headers: [
					{ key: "Link", value: agentLink },
					{ key: "Cache-Control", value: agentCache },
				],
			},
		];
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "images.unsplash.com",
			},
		],
	},
	async rewrites() {
		return [
			{
				source: "/api/analytics/track",
				destination: "https://rybbit.reloop.sh/api/track",
			},
			{
				source: "/api/analytics/site/:path*",
				destination: "https://rybbit.reloop.sh/api/site/:path*",
			},
			// Markdown twins (App Router skill.md / pricing.md win over afterFiles rewrite)
			{
				source: "/:path*.md",
				destination: "/api/markdown/:path*",
			},
		];
	},
};

export default nextConfig;
