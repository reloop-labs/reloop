import type { AlternativeDefinition } from "../types";

export const config: AlternativeDefinition = {
	slug: "postmark",
	path: "/alternatives/postmark",
	competitorName: "Postmark",
	compareHref: "/compare/postmark",
	titleLines: [
		"Best Postmark",
		"Alternative",
	],
	description: "Transactional email with deliverability focus—plus campaigns, self-hosting, and open-source transparency.",
	keywords: [
		"Postmark alternative",
		"Postmark competitor",
		"transactional email alternative",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Full comparison",
		href: "/compare/postmark",
	},
	highlights: [
		"Transactional-first with the same deliverability rigor",
		"Marketing campaigns when you outgrow transactional-only",
		"Self-hostable for compliance and data residency",
		"Open-source codebase for security review",
	],
	sections: [
		{
			title: "Beyond transactional-only",
			items: [
				{
					title: "Grow without switching",
					description: "Add campaigns on the same platform when marketing needs emerge.",
				},
				{
					title: "Ownership",
					description: "Postmark is proprietary hosted-only; Reloop gives you the source.",
				},
				{
					title: "Modern API",
					description: "Webhooks, SDKs, and sandbox for every major language.",
				},
			],
		},
	],
	cta: {
		title: "Postmark-grade delivery, more flexibility",
		titleMuted: "Start free today.",
		description: "Start free and scale to self-hosted when ready.",
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
