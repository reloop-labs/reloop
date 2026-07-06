import type { LandingPageDefinition } from "../types";

export const config: LandingPageDefinition = {
	slug: "startups",
	path: "/for/startups",
	titleLines: [
		"Email for",
		"Startups",
	],
	description: "Launch fast with free tier email—transactional, auth, and early campaigns without enterprise contracts.",
	keywords: [
		"email API for startups",
		"startup email infrastructure",
		"free transactional email",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Pricing",
		href: "/pricing",
	},
	sections: [
		{
			title: "Start free, scale later",
			items: [
				{
					title: "No credit card",
					description: "Free tier to validate product-market fit before you pay.",
				},
				{
					title: "One vendor",
					description: "Transactional + marketing on one platform as you grow.",
				},
				{
					title: "Self-host option",
					description: "When SaaS costs bite, deploy Reloop on your own cloud.",
				},
			],
		},
	],
	cta: {
		title: "Email infra for day one",
		titleMuted: "Start free today.",
		description: "From MVP to Series A on the same stack.",
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
