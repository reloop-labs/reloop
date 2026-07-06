import type { LandingPageDefinition } from "../types";

export const config: LandingPageDefinition = {
	slug: "automated-email",
	path: "/use-cases/automated-email",
	titleLines: ["Automated", "Email Flows"],
	description:
		"Trigger welcome series, drip campaigns, and renewal reminders from any user event — then let Reloop handle sequencing, timing, and per-step analytics.",
	keywords: [
		"email automation",
		"drip campaign software",
		"automated email sequences",
		"email workflow automation",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Workflows docs",
		href: "/docs",
	},
	sections: [
		{
			title: "Automate user journeys",
			items: [
				{
					title: "Welcome series",
					description:
						"Onboard new users with timed sequences triggered at signup.",
				},
				{
					title: "Renewal reminders",
					description:
						"Reduce churn with automated billing and subscription nudges.",
				},
				{
					title: "Re-engagement",
					description:
						"Win back inactive users with targeted win-back campaigns.",
				},
			],
		},
	],
	cta: {
		title: "Build automated flows",
		titleMuted: "Start free today.",
		description:
			"Combine webhooks, contacts, and campaigns for full lifecycle email.",
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
