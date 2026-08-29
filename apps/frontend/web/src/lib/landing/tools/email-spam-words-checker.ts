import type { ToolDefinition } from "../types";

export const config: ToolDefinition = {
	slug: "email-spam-words-checker",
	path: "/tools/email-spam-words-checker",
	toolType: "email-spam-words-checker",
	titleLines: ["Email Spam", "Words Checker"],
	description:
		"Scan email subject lines, copy, and link density in real time to calculate spam risk and reach the primary inbox.",
	keywords: [
		"email spam score checker",
		"spam score calculator",
		"email deliverability score",
		"spam trigger words detector",
		"spamassassin tester online",
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
			title: "Comprehensive Spam Inspection",
			items: [
				{
					title: "Spam Trigger Keywords",
					description:
						"Flags aggressive sales hype, false urgency, and deceptive phrases that trigger spam filters.",
				},
				{
					title: "Subject Line Quality",
					description:
						"Evaluates length, uppercase ratios, and repeated punctuation (!!!, ???).",
				},
				{
					title: "Link Safety & Shorteners",
					description:
						"Detects insecure HTTP protocols, high link density, and reputation-damaging public URL shorteners.",
				},
			],
		},
	],
	cta: {
		title: "Maximize inbox placement",
		titleMuted: "Send with Reloop.",
		description:
			"Reloop includes automated DKIM signing, deliverability monitoring, and zero vendor lock-in.",
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
			label: "All free tools",
			href: "/tools",
		},
	],
};
