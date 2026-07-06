import type { ToolDefinition } from "../types";

export const config: ToolDefinition = {
	slug: "subject-tester",
	path: "/tools/subject-tester",
	toolType: "subject-tester",
	titleLines: [
		"Subject Line",
		"Tester",
	],
	description: "Score and optimize email subject lines for length, clarity, and spam trigger words.",
	keywords: [
		"email subject line tester",
		"subject line analyzer",
		"email subject optimizer",
		"subject line score",
		"open rate subject line",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Read documentation",
		href: "/docs",
	},
	sections: [
		{
			title: "What makes a good subject line",
			items: [
				{
					title: "Length",
					description: "Keep subjects under 50 characters so they display fully on mobile devices.",
				},
				{
					title: "Clarity",
					description: "Tell recipients exactly what's inside—avoid vague or clickbait phrasing.",
				},
				{
					title: "Spam words",
					description: "Avoid ALL CAPS, excessive punctuation, and words that trigger filters.",
				},
			],
		},
	],
	cta: {
		title: "A/B test subjects in campaigns",
		titleMuted: "Start free today.",
		description: "Track open rates and compare subject lines with Reloop analytics.",
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
			label: "Email Analytics",
			href: "/features/email-analytics",
		},
		{
			label: "Campaigns",
			href: "/features/campaigns",
		},
	],
};
