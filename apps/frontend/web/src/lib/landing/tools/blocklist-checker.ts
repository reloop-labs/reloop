import type { ToolDefinition } from "../types";

export const config: ToolDefinition = {
	slug: "blocklist-checker",
	path: "/tools/blocklist-checker",
	toolType: "blocklist-checker",
	titleLines: ["Email Domain & IP", "Blocklist Checker"],
	description:
		"Query 20+ major anti-spam DNSBL databases in real time to verify whether your domain or IP is blacklisted, with direct removal links.",
	keywords: [
		"email blocklist checker",
		"dnsbl lookup",
		"ip blacklist checker",
		"spamhaus check",
		"barracuda rbl check",
		"rbl lookup",
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
			title: "Comprehensive Blocklist Inspection",
			items: [
				{
					title: "Spamhaus ZEN",
					description:
						"Checks SBL, XBL, CSS, and PBL aggregate records for compromised IPs and spam operations.",
				},
				{
					title: "Barracuda BRBL",
					description:
						"Monitors real-time spam traps and automated attack origins across the Barracuda network.",
				},
				{
					title: "SpamCop SCBL",
					description:
						"Automated user-reported spam scoring updated dynamically every 15 minutes.",
				},
			],
		},
	],
	cta: {
		title: "Protect your domain reputation",
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
			label: "Spam score checker",
			href: "/tools/spam-score-checker",
		},
		{
			label: "All free tools",
			href: "/tools",
		},
	],
};
