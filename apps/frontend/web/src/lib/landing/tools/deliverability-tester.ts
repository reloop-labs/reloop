import type { ToolDefinition } from "../types";

export const config: ToolDefinition = {
	slug: "deliverability-tester",
	path: "/tools/deliverability-tester",
	toolType: "deliverability-tester",
	titleLines: ["Email Deliverability", "Tester"],
	description:
		"Send a test email to get a full 0–10 score and diagnostic report: SPF, DKIM, DMARC alignment, DNSBL blacklists, Rspamd spam filters, MIME structure, and link reachability.",
	keywords: [
		"mail tester",
		"email deliverability test",
		"spam score checker",
		"email spam test",
		"dkim tester",
		"spf dmarc checker",
		"deliverability diagnostic",
		"inbound email spam check",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Deliverability features",
		href: "/features/deliverability",
	},
	sections: [
		{
			title: "Diagnostic categories",
			items: [
				{
					title: "Authentication & Identity",
					description:
						"Verify cryptographic DKIM signatures, SPF return-path alignment, DMARC policy enforcement, and reverse DNS (FCrDNS).",
				},
				{
					title: "IP & Domain Blacklists",
					description:
						"Scan sending IP and domains across major DNSBLs (Spamhaus ZEN/DBL, Barracuda, SpamCop, URIBL, and SURBL).",
				},
				{
					title: "Rspamd & Content Filters",
					description:
						"Evaluate incoming spam score, triggered heuristic symbols, deceptive trigger keywords, and excessive uppercase formatting.",
				},
				{
					title: "MIME & Link Structure",
					description:
						"Inspect multipart HTML/plain-text balance, image alt attributes, RFC 8058 List-Unsubscribe headers, and link reachability.",
				},
			],
		},
	],
	cta: {
		title: "Monitor deliverability in production",
		titleMuted: "Start free today.",
		description:
			"Reloop provides continuous reputation monitoring, dedicated IPs, automated warm-up, and real-time bounce analytics.",
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
			label: "Blocklist checker",
			href: "/tools/blocklist-checker",
		},
		{
			label: "Auth checker",
			href: "/tools/auth-checker",
		},
		{
			label: "Email spam words checker",
			href: "/tools/email-spam-words-checker",
		},
	],
};
