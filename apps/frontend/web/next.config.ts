import type { NextConfig } from "next";
import {
	AGENT_CACHE_CONTROL as agentCache,
	AGENT_LINK_HEADER as agentLink,
} from "./src/lib/agent-headers";

const nextConfig: NextConfig = {
	serverExternalPackages: ["next-mdx-remote", "next-mdx-remote/rsc"],
	output: "standalone",
	outputFileTracingIncludes: {
		"/**": ["./content/**/*"],
	},
	allowedDevOrigins: ["local.reloop.sh", "*.local.reloop.sh"],
	cacheComponents: true,
	// No experimental.inlineCss: it embedded the full ~470KB stylesheet in every
	// HTML response three times (<style> + twice in the RSC payload), pushing the
	// landing page past Googlebot's 2MB HTML limit. External CSS is cached instead.
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
				// Marketing HTML + agent routes: short cache for AFDocs cache hygiene
				source:
					"/:path((?!_next/static|_next/image|font/|manifest\\.json|healthz)(?!.*\\.md$).*)",
				headers: [
					{ key: "Link", value: agentLink },
					{ key: "Cache-Control", value: agentCache },
				],
			},
			...[
				["/index.md", ""],
				["/pricing.md", "/pricing"],
				["/about.md", "/about"],
				["/developers.md", "/developers"],
			].map(([file, page]) => ({
				source: file as string,
				headers: [
					{
						key: "Link",
						value: `${agentLink}, <https://reloop.sh${page}>; rel="canonical"`,
					},
					{ key: "Cache-Control", value: agentCache },
				],
			})),
		];
	},
	async rewrites() {
		return {
			beforeFiles: [],
			afterFiles: [
				// ARD v0.91 moved the catalog to ard.json; keep the legacy path for older readers
				{
					source: "/.well-known/ai-catalog.json",
					destination: "/.well-known/ard.json",
				},
				// Markdown twins (App Router skill.md / pricing.md win over afterFiles rewrite)
				{
					source: "/:path*.md",
					destination: "/api/markdown/:path*",
				},
			],
			// Runs only after every page and dynamic route failed to match, so
			// agents asking for Markdown get a Markdown 404 instead of the HTML page.
			fallback: [
				{
					source: "/:path*",
					has: [{ type: "header", key: "accept", value: ".*text/markdown.*" }],
					destination: "/api/markdown-not-found/:path*",
				},
			],
		};
	},
};

export default nextConfig;
