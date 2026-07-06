import type { ToolDefinition } from "../types";

export const config: ToolDefinition = {
	slug: "deliverability-tester",
	path: "/tools/deliverability-tester",
	toolType: "deliverability-tester",
	titleLines: ["Email Deliverability", "Tester"],
	description:
		"Analyze your email content for spam signals, authentication gaps, and inbox placement risk.",
	keywords: [
		"email deliverability test",
		"spam score checker",
		"inbox placement test",
		"email spam analyzer",
		"deliverability checker",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Deliverability tools",
		href: "/features/deliverability",
	},
	sections: [
		{
			title: "What we analyze",
			items: [
				{
					title: "Spam triggers",
					description:
						"Flag risky words, excessive links, and HTML patterns that spam filters penalize.",
				},
				{
					title: "Content balance",
					description:
						"Check text-to-image ratio and link density for healthier inbox placement.",
				},
				{
					title: "Authentication hints",
					description:
						"Reminders to set up SPF, DKIM, and DMARC for your sending domain.",
				},
			],
		},
	],
	cta: {
		title: "Monitor deliverability in production",
		titleMuted: "Start free today.",
		description:
			"Reloop includes spam testing, reputation monitoring, and auth setup guides.",
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
			label: "Deliverability feature",
			href: "/features/deliverability",
		},
		{
			label: "Auth checker",
			href: "/tools/auth-checker",
		},
	],
};
