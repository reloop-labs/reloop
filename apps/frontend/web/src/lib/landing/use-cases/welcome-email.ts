import type { LandingPageDefinition } from "../types";

export const config: LandingPageDefinition = {
	slug: "welcome-email",
	path: "/use-cases/welcome-email",
	titleLines: ["Welcome Email", "Automation"],
	description:
		"Onboard new users with branded welcome emails triggered at signup.",
	keywords: [
		"welcome email automation",
		"onboarding email API",
		"welcome email template",
		"signup welcome email",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Automated email",
		href: "/use-cases/automated-email",
	},
	sections: [
		{
			title: "First impressions matter",
			items: [
				{
					title: "Trigger at signup",
					description:
						"Send welcome emails via API or webhook when a user registers.",
				},
				{
					title: "On-brand templates",
					description:
						"Design welcome emails that match your product's look and voice.",
				},
				{
					title: "Series support",
					description: "Extend into multi-step onboarding sequences over time.",
				},
			],
		},
	],
	cta: {
		title: "Welcome every new user",
		titleMuted: "Start free today.",
		description: "Free tier includes templates and transactional sends.",
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
