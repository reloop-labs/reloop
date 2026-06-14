/** @type {import('next').NextConfig} */
const config = {
	reactStrictMode: true,
	basePath: "/docs",
	output: "standalone",
	poweredByHeader: false,
	allowedDevOrigins: ["local.reloop.sh", "*.local.reloop.sh"],
	serverExternalPackages: ["next-mdx-remote", "next-mdx-remote/rsc"],
	experimental: {
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
		];
	},
	async headers() {
		return [
			{
				source: "/:path*",
				headers: [
					{
						key: "Link",
						value: '</docs/llms.txt>; rel="llms-txt"',
					},
				],
			},
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
		];
	},
};

export default config;
