import type { LandingPageDefinition } from "../types";

export const config: LandingPageDefinition = {
	slug: "laravel",
	path: "/integrations/laravel",
	titleLines: ["Send Email", "with Laravel"],
	description:
		"Send transactional email from Laravel using the Reloop PHP SDK or SMTP relay.",
	keywords: [
		"Laravel transactional email",
		"Laravel email API",
		"send email Laravel",
		"Reloop Laravel",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "PHP SDK",
		href: "/languages/php",
	},
	sections: [
		{
			title: "Laravel integration paths",
			items: [
				{
					title: "PHP SDK",
					description:
						"Call Reloop directly from controllers, jobs, and notifications.",
				},
				{
					title: "SMTP relay",
					description:
						"Configure Laravel Mail to use Reloop SMTP for drop-in compatibility.",
				},
				{
					title: "Queued sends",
					description:
						"Dispatch email jobs to Laravel queues for async delivery.",
				},
			],
		},
	],
	cta: {
		title: "Laravel email that scales",
		titleMuted: "Start free today.",
		description: "Works with Forge, Vapor, and self-hosted deployments.",
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
