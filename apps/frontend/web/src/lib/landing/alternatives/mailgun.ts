import type { AlternativeDefinition } from "../types";

export const config: AlternativeDefinition = {
	slug: "mailgun",
	path: "/alternatives/mailgun",
	competitorName: "Mailgun",
	compareHref: "/compare/mailgun",
	titleLines: [
		"Best Mailgun",
		"Alternative",
	],
	description: "Developer email API with deliverability tools, webhooks, and the option to self-host.",
	keywords: [
		"Mailgun alternative",
		"Mailgun competitor",
		"open source Mailgun",
		"self-hosted Mailgun",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Full comparison",
		href: "/compare/mailgun",
	},
	highlights: [
		"REST API + SMTP relay with event webhooks",
		"Built-in validation, analytics, and deliverability monitoring",
		"Self-host for data residency and cost control",
		"Campaign builder beyond pure transactional sends",
	],
	sections: [
		{
			title: "Reloop vs Mailgun",
			items: [
				{
					title: "Full stack",
					description: "Transactional, campaigns, templates, and contacts in one product.",
				},
				{
					title: "Self-hosting",
					description: "Mailgun is hosted-only; Reloop runs on your infrastructure.",
				},
				{
					title: "Agent-ready",
					description: "Native inbox APIs for AI workflows Mailgun doesn't offer.",
				},
			],
		},
	],
	cta: {
		title: "Replace Mailgun",
		titleMuted: "Start free today.",
		description: "Drop-in SMTP and REST API migration paths.",
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
