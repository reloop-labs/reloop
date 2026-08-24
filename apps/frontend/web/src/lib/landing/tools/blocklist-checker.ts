import {
	domainBlocklistCount,
	ipBlocklistCount,
	publicBlocklistCount,
} from "@reloop/web/app/tools/blocklist-checker/content";
import type { ToolDefinition } from "../types";

export const config: ToolDefinition = {
	slug: "blocklist-checker",
	path: "/tools/blocklist-checker",
	toolType: "blocklist-checker",
	titleLines: ["IP & Domain DNS", "Blocklist Checker"],
	description: `Look up a sending IP or domain name against ${publicBlocklistCount} public DNS blocklists (${ipBlocklistCount} IP lists, ${domainBlocklistCount} domain URI lists). Failed queries are errors, not clean.`,
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
			title: "What the checker queries",
			items: [
				{
					title: `${ipBlocklistCount} IP DNS blocklists`,
					description:
						"Spamhaus ZEN, Barracuda, SpamCop, and other public IP zones. One Spamhaus query (ZEN) covers SBL, CSS, XBL, and PBL.",
				},
				{
					title: `${domainBlocklistCount} domain URI lists`,
					description:
						"The domain name is looked up on DBL, URIBL, SURBL, and similar lists. This is not a website crawl and not an MX lookup.",
				},
				{
					title: "Failed queries stay failed",
					description:
						"Timeouts and refused replies are reported as errors. They are never counted as clean.",
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
