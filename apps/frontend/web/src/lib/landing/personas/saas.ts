import type { LandingPageDefinition } from "../types";

export const config: LandingPageDefinition = {
	slug: "saas",
	path: "/for/saas",
	titleLines: [
		"Email for",
		"SaaS",
	],
	description: "Product-led email—onboarding, billing, lifecycle, and in-app triggered sends for SaaS companies.",
	keywords: [
		"SaaS email platform",
		"SaaS transactional email",
		"product-led email",
		"lifecycle email SaaS",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Use cases",
		href: "/use-cases",
	},
	sections: [
		{
			title: "SaaS email lifecycle",
			items: [
				{
					title: "Onboarding",
					description: "Welcome, verify, and activate new trial users automatically.",
				},
				{
					title: "Billing",
					description: "Receipts, failed payment, and renewal emails via Stripe webhooks.",
				},
				{
					title: "Engagement",
					description: "Re-engagement and upgrade nudges based on product usage.",
				},
			],
		},
	],
	cta: {
		title: "Email that matches your product",
		titleMuted: "Start free today.",
		description: "Webhooks, contacts API, and campaign automation.",
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
