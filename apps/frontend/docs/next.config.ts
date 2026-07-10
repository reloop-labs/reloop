
/** @type {import('next').NextConfig} */
const config = {
	reactStrictMode: true,
	basePath: "/docs",
	output: "standalone",
	poweredByHeader: false,
	allowedDevOrigins: ["local.reloop.sh", "*.local.reloop.sh"],
	serverExternalPackages: ["next-mdx-remote", "next-mdx-remote/rsc"],
	partialPrefetching: true,
	cacheComponents: true,
	experimental: {
		turbopackMemoryEviction: false,
		optimizePackageImports: [
			"lucide-react",
			"simple-icons",
			"framer-motion",
			"@radix-ui/react-dialog",
			"@radix-ui/react-popover",
			"@radix-ui/react-collapsible",
			"@radix-ui/react-scroll-area",
			"@radix-ui/react-presence",
			"@mintlify/components",
		],
	},
	async rewrites() {
		return [
			{
				source: "/:path*.md",
				destination: "/api/markdown/:path*",
			},
			{
				source: "/api/script.js",
				destination: "https://rybbit.reloop.sh/api/script.js",
			},
			{
				source: "/api/track",
				destination: "https://rybbit.reloop.sh/api/track",
			},
			{
				source: "/api/site/:path*",
				destination: "https://rybbit.reloop.sh/api/site/:path*",
			},
		];
	},
	async headers() {
		const isDev = process.env.NODE_ENV === "development";

		const list = [
			{
				source: "/:path*",
				headers: [
					{
						key: "Link",
						value: '</docs/llms.txt>; rel="llms-txt"',
					},
				],
			},
		];

		if (!isDev) {
			list.push(
				// Cache static assets aggressively (JS/CSS chunks are content-hashed)
				{
					source: "/_next/static/:path*",
					headers: [
						{
							key: "Cache-Control",
							value: "public, max-age=31536000, immutable",
						},
					],
				},
				// Cache font files
				{
					source: "/docs/font/:path*",
					headers: [
						{
							key: "Cache-Control",
							value: "public, max-age=31536000, immutable",
						},
					],
				},
			);
		}

		return list;
	},
};

export default config;
