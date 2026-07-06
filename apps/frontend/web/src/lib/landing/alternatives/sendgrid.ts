import type { AlternativeDefinition } from "../types";

export const config: AlternativeDefinition = {
	slug: "sendgrid",
	path: "/alternatives/sendgrid",
	competitorName: "SendGrid",
	compareHref: "/compare/sendgrid",
	titleLines: ["Best SendGrid", "Alternative"],
	description:
		"Modern email infrastructure without SendGrid's complexity—open source, developer-first, and self-hostable.",
	keywords: [
		"SendGrid alternative",
		"SendGrid competitor",
		"open source SendGrid",
		"cheaper SendGrid alternative",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Full comparison",
		href: "/compare/sendgrid",
	},
	highlights: [
		"Simpler API and dashboard without legacy Twilio baggage",
		"Self-hostable—no per-email lock-in on proprietary infrastructure",
		"Campaigns and transactional on one platform",
		"Modern SDKs with TypeScript-first developer experience",
	],
	sections: [
		{
			title: "Why teams leave SendGrid",
			items: [
				{
					title: "Pricing clarity",
					description:
						"Predictable tiers without surprise overages on legacy plans.",
				},
				{
					title: "Modern DX",
					description:
						"Clean APIs, webhooks, and docs built for 2026—not 2012.",
				},
				{
					title: "Open source",
					description:
						"No black box—inspect routing, quotas, and delivery logic.",
				},
			],
		},
	],
	cta: {
		title: "Switch from SendGrid",
		titleMuted: "Start free today.",
		description: "SMTP-compatible relay makes migration straightforward.",
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
