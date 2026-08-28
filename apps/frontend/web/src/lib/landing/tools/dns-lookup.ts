import type { ToolDefinition } from "../types";

export const config: ToolDefinition = {
	slug: "dns-lookup",
	path: "/tools/dns-lookup",
	toolType: "dns-lookup",
	titleLines: ["DNS Lookup &", "Record Analyzer"],
	description:
		"Query A, AAAA, MX, TXT, CNAME, NS, SOA, CAA, and PTR records with live DNS provider detection and deliverability health checks.",
	keywords: [
		"DNS lookup",
		"DNS record checker",
		"MX lookup",
		"A record lookup",
		"TXT record check",
		"nameserver lookup",
		"reverse DNS lookup",
		"DNS propagation",
		"DNS provider detection",
		"SuperTool alternative",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "SPF & DMARC checker",
		href: "/tools/auth-checker",
	},
	sections: [
		{
			title: "Supported DNS record types",
			items: [
				{
					title: "A & AAAA Records",
					description:
						"Maps domain names to IPv4 and IPv6 addresses with live TTL inspection.",
				},
				{
					title: "MX Records",
					description:
						"Identifies receiving mail servers, priority order, and server availability.",
				},
				{
					title: "TXT & Auth Records",
					description:
						"Verifies SPF policies, DKIM keys, DMARC rules, and verification tags.",
				},
				{
					title: "NS & SOA Records",
					description:
						"Detects authoritative nameservers, zone masters, serials, and TTL timeouts.",
				},
			],
		},
	],
	cta: {
		title: "Supercharge your email infrastructure",
		titleMuted: "Built for modern senders.",
		description:
			"Send transactional and cold emails with automated DNS setup, inbox placement analytics, and 99.9% uptime.",
		primary: {
			label: "Start sending free",
			href: "/dashboard/signup",
		},
		secondary: {
			label: "Read documentation",
			href: "/docs",
		},
	},
	relatedLinks: [
		{
			label: "SPF & DMARC checker",
			href: "/tools/auth-checker",
		},
		{
			label: "Blocklist checker",
			href: "/tools/blocklist-checker",
		},
		{
			label: "Deliverability tester",
			href: "/tools/deliverability-tester",
		},
	],
};
