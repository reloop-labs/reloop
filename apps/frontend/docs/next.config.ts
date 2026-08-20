/** @type {import('next').NextConfig} */
const config = {
	reactStrictMode: true,
	basePath: "/docs",
	output: "standalone",
	poweredByHeader: false,
	allowedDevOrigins: ["local.reloop.sh", "*.local.reloop.sh"],
	serverExternalPackages: ["next-mdx-remote", "next-mdx-remote/rsc"],
	cacheComponents: true,
	// Contact learn pages (many Videos + code samples + accordions) exceed the
	// default 60s under CI parallel static generation.
	staticPageGenerationTimeout: 180,
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
		],
	},
	async redirects() {
		return [
			// Collapsed multi-page API Keys learn section into a single page
			{
				source: "/learn/api-keys/managing-api-keys",
				destination: "/learn/api-keys",
				permanent: true,
			},
			{
				source: "/learn/api-keys/details",
				destination: "/learn/api-keys#security",
				permanent: true,
			},
			// Connect a domain moved under Guides
			{
				source: "/connect-domain",
				destination: "/guides/connect-domain",
				permanent: true,
			},
			{
				source: "/connect-domain/:path*",
				destination: "/guides/connect-domain/:path*",
				permanent: true,
			},
			// Old /docs/dns/* bookmarks → DNS records explained
			{
				source: "/dns",
				destination: "/guides/connect-domain/dns-records-explained",
				permanent: true,
			},
			{
				source: "/dns/:path*",
				destination: "/guides/connect-domain/dns-records-explained",
				permanent: true,
			},
			// Old /docs/domains shortcut used by dashboard hotkeys
			{
				source: "/domains",
				destination: "/learn/domain",
				permanent: true,
			},
			// Renamed / legacy product docs paths from the dashboard
			{
				source: "/features/contacts",
				destination: "/learn/contacts",
				permanent: true,
			},
			{
				source: "/features/contacts/:path*",
				destination: "/learn/contacts/:path*",
				permanent: true,
			},
			{
				source: "/learn/automations",
				destination: "/learn/workflows",
				permanent: true,
			},
			{
				source: "/api-reference/api-keys",
				destination: "/api/api-key/get-api-api-key-v1",
				permanent: true,
			},
			{
				source: "/api-reference/contacts",
				destination: "/api/contacts/post-api-contacts-create",
				permanent: true,
			},
			{
				source: "/api/contacts",
				destination: "/api/contacts/get-api-contacts-list",
				permanent: true,
			},
			{
				source: "/api/api-key",
				destination: "/api/api-key/get-api-api-key-v1",
				permanent: true,
			},
			{
				source: "/email",
				destination: "/setup/backend/email",
				permanent: true,
			},
			{
				source: "/setup/email",
				destination: "/setup/backend/email",
				permanent: true,
			},
		];
	},
	async rewrites() {
		return [
			// Markdown twins for doc pages (afterFiles: App Router skill.md route wins)
			{
				source: "/:path*.md",
				destination: "/api/markdown/:path*",
			},
		];
	},
	async headers() {
		const isDev = process.env.NODE_ENV === "development";

		// Agent discovery is on the marketing web origin (not this docs app)
		const agentLink =
			'</llms.txt>; rel="llms-txt", </llms-docs.txt>; rel="docs-llms-txt", </llms-full-docs.txt>; rel="llms-full-txt", </skill.md>; rel="skill-md", </docs/sitemap.md>; rel="sitemap"';
		const agentCache = "public, max-age=300, s-maxage=3600, must-revalidate";

		const list = [
			// Hashed static assets — long cache (must be listed before the catch-all)
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
				// Docs HTML/API/agent content — short cache so agents see updates promptly.
				// Exclude hashed static assets.
				source: "/:path((?!_next/static|_next/image|font/).*)",
				headers: [
					{
						key: "Link",
						value: agentLink,
					},
					{
						key: "Cache-Control",
						value: agentCache,
					},
				],
			},
			// Steer agents that land on the human API Keys page to the agent corpus
			{
				source: "/learn/api-keys",
				headers: [
					{
						key: "Link",
						value: `</docs/learn/ai/api-keys.md>; rel="alternate"; type="text/markdown", ${agentLink}`,
					},
					{
						key: "Cache-Control",
						value: agentCache,
					},
				],
			},
			{
				source: "/learn/api-keys.md",
				headers: [
					{
						key: "Link",
						value: `</docs/learn/ai/api-keys.md>; rel="alternate"; type="text/markdown", ${agentLink}`,
					},
					{
						key: "Cache-Control",
						value: agentCache,
					},
				],
			},
		];

		return list;
	},
};

export default config;
