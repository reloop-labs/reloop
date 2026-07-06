import type { AlternativeDefinition } from "../types";

export const config: AlternativeDefinition = {
	slug: "aws-ses",
	path: "/alternatives/aws-ses",
	competitorName: "AWS SES",
	compareHref: "/compare/aws-ses",
	titleLines: [
		"Best AWS SES",
		"Alternative",
	],
	description: "Email infrastructure with a real dashboard, templates, and campaigns—without wiring SES yourself.",
	keywords: [
		"AWS SES alternative",
		"SES alternative",
		"cheaper than AWS SES",
		"SES competitor with dashboard",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Full comparison",
		href: "/compare/aws-ses",
	},
	highlights: [
		"Dashboard, templates, and analytics out of the box",
		"No sandbox limits or IAM policy debugging",
		"Self-host option for teams that want SES-level cost without AWS",
		"Campaigns and marketing tools SES doesn't provide",
	],
	sections: [
		{
			title: "When SES isn't enough",
			items: [
				{
					title: "Developer time",
					description: "SES is cheap but you build everything—Reloop ships the full product.",
				},
				{
					title: "Marketing email",
					description: "Campaigns, segmentation, and analytics without a second vendor.",
				},
				{
					title: "Support & docs",
					description: "Human-readable docs and community—not AWS support tickets.",
				},
			],
		},
	],
	cta: {
		title: "Skip the SES assembly",
		titleMuted: "Start free today.",
		description: "Hosted Reloop or self-host on your own cloud.",
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
