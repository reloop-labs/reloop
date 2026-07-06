import type { AlternativeDefinition } from "../types";

export const config: AlternativeDefinition = {
	slug: "resend",
	path: "/alternatives/resend",
	competitorName: "Resend",
	compareHref: "/compare/resend",
	titleLines: [
		"Best Resend",
		"Alternative",
	],
	description: "Open-source email infrastructure with the same developer DX as Resend—plus self-hosting, campaigns, and agent workflows.",
	keywords: [
		"Resend alternative",
		"open source Resend alternative",
		"Resend competitor",
		"self-hosted Resend",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Full comparison",
		href: "/compare/resend",
	},
	highlights: [
		"Apache 2.0 open-source codebase you can audit and self-host",
		"Campaigns, SMTP relay, and agent inbox—not just transactional API",
		"Same REST API ergonomics with official SDKs for every major language",
		"Hosted by Reloop Labs or deploy on your own infrastructure",
	],
	sections: [
		{
			title: "Why teams switch from Resend",
			items: [
				{
					title: "Ownership",
					description: "Read the source, run your own stack, or use hosted—your data, your choice.",
				},
				{
					title: "One platform",
					description: "Transactional, marketing, and AI agent email without adding vendors.",
				},
				{
					title: "Transparent pricing",
					description: "Free tier to start; self-host for unlimited sends on your hardware.",
				},
			],
		},
	],
	cta: {
		title: "Try the Resend alternative",
		titleMuted: "Start free today.",
		description: "Migrate in an afternoon with SDKs and SMTP compatibility.",
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
