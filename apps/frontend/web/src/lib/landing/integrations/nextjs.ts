import type { LandingPageDefinition } from "../types";

export const config: LandingPageDefinition = {
	slug: "nextjs",
	path: "/integrations/nextjs",
	titleLines: ["Send Email", "with Next.js"],
	description:
		"Send transactional and marketing email from Next.js App Router and API routes with the Reloop SDK.",
	keywords: [
		"send email Next.js",
		"Next.js transactional email",
		"Next.js email API",
		"Reloop Next.js",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Node.js SDK",
		href: "/languages/nodejs",
	},
	sections: [
		{
			title: "Next.js integration",
			items: [
				{
					title: "App Router",
					description:
						"Send from Server Actions and Route Handlers with environment-scoped API keys.",
				},
				{
					title: "Edge & serverless",
					description:
						"Lightweight HTTP API calls work on Vercel Edge and serverless functions.",
				},
				{
					title: "React Email",
					description: "Render JSX email templates and send via Reloop's API.",
				},
			],
		},
	],
	cta: {
		title: "Email in your Next.js app",
		titleMuted: "Start free today.",
		description:
			"Install the SDK and send your first email in under five minutes.",
		primary: {
			label: "Get started free",
			href: "/dashboard/signup",
		},
		secondary: {
			label: "Read documentation",
			href: "/docs",
		},
	},
	relatedLinks: [
		{
			label: "Vercel integration",
			href: "/integrations/vercel",
		},
		{
			label: "Node.js guide",
			href: "/languages/nodejs",
		},
	],
};
