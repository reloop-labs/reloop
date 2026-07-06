import type { AlternativeDefinition } from "../types";

export const config: AlternativeDefinition = {
	slug: "loops",
	path: "/alternatives/loops",
	competitorName: "Loops",
	compareHref: "/compare/loops",
	titleLines: [
		"Best Loops",
		"Alternative",
	],
	description: "Product email for SaaS teams—transactional, lifecycle, and campaigns with open-source flexibility.",
	keywords: [
		"Loops alternative",
		"Loops competitor",
		"SaaS email platform alternative",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Full comparison",
		href: "/compare/loops",
	},
	highlights: [
		"Lifecycle and transactional email for product-led SaaS",
		"Self-host when you need data control beyond Loops' hosted model",
		"Agent inbox and workflows Loops doesn't offer",
		"Open-source with full API access",
	],
	sections: [
		{
			title: "Product email, your way",
			items: [
				{
					title: "SaaS lifecycle",
					description: "Welcome, upgrade, and churn emails triggered from your product events.",
				},
				{
					title: "Infrastructure choice",
					description: "Hosted or self-hosted—Loops is hosted-only.",
				},
				{
					title: "Beyond email marketing",
					description: "SMTP, webhooks, validation, and agent APIs in one platform.",
				},
			],
		},
	],
	cta: {
		title: "Product email without lock-in",
		titleMuted: "Start free today.",
		description: "Built for SaaS teams who also ship code.",
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
