import type { LandingPageDefinition } from "../types";

export const config: LandingPageDefinition = {
	slug: "open-source-projects",
	path: "/for/open-source-projects",
	titleLines: [
		"Email for",
		"Open Source",
	],
	description: "Free-tier friendly email for OSS maintainers—newsletters, release announcements, and community updates.",
	keywords: [
		"open source project email",
		"OSS email infrastructure",
		"free email for open source",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Why open source",
		href: "/philosophy/why-open-source",
	},
	sections: [
		{
			title: "Built by OSS, for OSS",
			items: [
				{
					title: "Same license ethos",
					description: "Reloop is Apache 2.0—you can self-host what we ship.",
				},
				{
					title: "Community updates",
					description: "Newsletters and release emails for your contributors.",
				},
				{
					title: "Transparent infra",
					description: "No proprietary black box behind your project's communications.",
				},
			],
		},
	],
	cta: {
		title: "Email infra that matches your values",
		titleMuted: "Start free today.",
		description: "Open source end to end.",
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
