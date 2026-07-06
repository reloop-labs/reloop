import type { LandingPageDefinition } from "../types";

export const config: LandingPageDefinition = {
	slug: "marketing-email",
	path: "/use-cases/marketing-email",
	titleLines: ["Marketing", "Email Platform"],
	description:
		"Newsletters, product launches, and promotional campaigns with segmentation, analytics, and a visual editor.",
	keywords: [
		"marketing email platform",
		"newsletter software",
		"email marketing API",
		"promotional email service",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Campaigns",
		href: "/features/campaigns",
	},
	sections: [
		{
			title: "Campaign tools",
			items: [
				{
					title: "Visual editor",
					description:
						"Drag-and-drop campaign builder with responsive templates.",
				},
				{
					title: "Segmentation",
					description:
						"Target audiences by behavior, tags, and custom properties.",
				},
				{
					title: "Analytics",
					description:
						"Track opens, clicks, and conversions across every campaign.",
				},
			],
		},
	],
	cta: {
		title: "Launch your first campaign",
		titleMuted: "Start free today.",
		description: "Free tier includes campaigns, templates, and analytics.",
		primary: {
			label: "Get started free",
			href: "/dashboard/signup",
		},
		secondary: {
			label: "Read documentation",
			href: "/docs",
		},
	},
	relatedLinks: [
		{
			label: "For marketing teams",
			href: "/features/marketing-teams",
		},
		{
			label: "Campaign Builder",
			href: "/features/campaign-builder",
		},
	],
};
