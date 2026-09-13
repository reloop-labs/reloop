import type { ToolDefinition } from "../types";

export const config: ToolDefinition = {
	slug: "domain-reputation-checker",
	path: "/tools/domain-reputation-checker",
	toolType: "domain-reputation-checker",
	titleLines: ["Domain Reputation", "Checker"],
	description:
		"Evaluate your sending domain reputation with a 0–100 score, letter grade (A+ to F), live DNSBL checks, authentication status, and domain maturity analysis.",
	keywords: [
		"domain reputation checker",
		"sender reputation score",
		"email domain reputation",
		"domain health check",
		"SPF DKIM DMARC test",
		"domain blocklist audit",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Sender reputation guide",
		href: "/glossary/sender-reputation",
	},
	sections: [
		{
			title: "Reputation evaluation pillars",
			items: [
				{
					title: "Email Authentication (35%)",
					description:
						"SPF alignment, cryptographic DKIM signatures, and DMARC enforcement policies.",
				},
				{
					title: "Live Blocklists (30%)",
					description:
						"Query Spamhaus DBL, URIBL, SURBL, SEM URIBL, and NordSpam in real-time.",
				},
				{
					title: "Domain Age & Warmup (20%)",
					description:
						"RDAP registration date analysis to detect cold and young domain deliverability risks.",
				},
				{
					title: "DNS Infrastructure (15%)",
					description:
						"Mail exchange (MX) reachability, redundant nameservers, and TLS/SSL certificate status.",
				},
			],
		},
	],
	cta: {
		title: "Protect your sender reputation",
		titleMuted: "Deliver emails with confidence.",
		description:
			"Reloop helps you maintain pristine inbox deliverability with automated authentication, warm-up tools, and suppression lists.",
		primary: {
			label: "Get started free",
			href: "/dashboard/signup",
		},
		secondary: {
			label: "Explore all tools",
			href: "/tools",
		},
	},
	relatedLinks: [
		{
			label: "Auth checker",
			href: "/tools/auth-checker",
		},
		{
			label: "Blocklist checker",
			href: "/tools/blocklist-checker",
		},
		{
			label: "Domain age tool",
			href: "/tools/domain-age",
		},
		{
			label: "Deliverability tester",
			href: "/tools/deliverability-tester",
		},
	],
};
