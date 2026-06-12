/** @type {import('next').NextConfig} */
const config = {
	reactStrictMode: true,
	basePath: "/docs",
	output: "standalone",
	allowedDevOrigins: ["local.reloop.sh", "*.local.reloop.sh"],
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
		];
	},
};

export default config;
