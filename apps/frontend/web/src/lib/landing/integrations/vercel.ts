import type { LandingPageDefinition } from "../types";

export const config: LandingPageDefinition = {
	slug: "vercel",
	path: "/integrations/vercel",
	titleLines: ["Send Email", "on Vercel"],
	description:
		"Deploy Next.js or serverless apps on Vercel and send email via Reloop API.",
	keywords: ["Vercel email", "send email Vercel", "Vercel transactional email"],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Next.js guide",
		href: "/integrations/nextjs",
	},
	sections: [
		{
			title: "Vercel deployment",
			items: [
				{
					title: "Environment variables",
					description: "Store RELOOP_API_KEY in Vercel project settings.",
				},
				{
					title: "Serverless functions",
					description:
						"Send from API routes without managing SMTP connections.",
				},
				{
					title: "Edge compatibility",
					description: "HTTP API works on Edge Runtime where SMTP does not.",
				},
			],
		},
	],
	cta: {
		title: "Email for Vercel projects",
		titleMuted: "Start free today.",
		description: "Works with Next.js, Nuxt, and any Vercel serverless app.",
		primary: {
			label: "Get started free",
			href: "/dashboard/signup",
		},
		secondary: {
			label: "Read documentation",
			href: "/docs",
		},
	},
};
