import type { AlternativeDefinition } from "../types";

export const config: AlternativeDefinition = {
	slug: "mailchimp",
	path: "/alternatives/mailchimp",
	competitorName: "Mailchimp",
	compareHref: "/compare/mailchimp",
	titleLines: ["Best Mailchimp", "Alternative"],
	description:
		"Email platform for developers and marketers who want API access, self-hosting, and no legacy bloat.",
	keywords: [
		"Mailchimp alternative",
		"Mailchimp alternative for developers",
		"developer-friendly email marketing",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Full comparison",
		href: "/compare/mailchimp",
	},
	highlights: [
		"API-first campaigns—not just a drag-and-drop marketing tool",
		"Transactional + marketing on one stack",
		"Self-hostable for teams that outgrow SaaS pricing",
		"Clean, modern UI without Mailchimp's upsell maze",
	],
	sections: [
		{
			title: "Mailchimp for builders",
			items: [
				{
					title: "Developer APIs",
					description: "Send campaigns and transactionals programmatically.",
				},
				{
					title: "No platform tax",
					description: "Transparent pricing without constant upgrade prompts.",
				},
				{
					title: "Open source",
					description:
						"Extend, fork, or self-host instead of waiting on feature requests.",
				},
			],
		},
	],
	cta: {
		title: "Marketing email for developers",
		titleMuted: "Start free today.",
		description: "Campaign builder + API + self-host option.",
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
