import type { ToolDefinition } from "../types";

export const config: ToolDefinition = {
	slug: "spf-generator",
	path: "/tools/spf-generator",
	toolType: "spf-generator",
	titleLines: ["SPF Record", "Generator"],
	description:
		"Build a copy-pasteable v=spf1 TXT record from IPs, includes, and a terminal policy. Warns about the 10-lookup limit.",
	keywords: ["SPF generator", "SPF record wizard", "create SPF"],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "What is SPF?",
		href: "/glossary/spf",
	},
	sections: [
		{
			title: "SPF record",
			items: [
				{
					title: "Mechanisms",
					description:
						"ip4, ip6, include, a, and mx. DNS-querying mechanisms count toward the 10-lookup cap.",
				},
				{
					title: "One record",
					description:
						"Never publish two v=spf1 TXT records on the same name. Merge every sender into one.",
				},
				{
					title: "Policy",
					description:
						"End with ~all while onboarding senders, then -all once the list is complete.",
				},
			],
		},
	],
	cta: {
		title: "Auto-configure SPF in Reloop",
		titleMuted: "Start free today.",
		description:
			"Guided DNS setup for SPF, DKIM, and DMARC when you add a domain.",
		primary: {
			label: "Get started free",
			href: "/dashboard/signup",
		},
		secondary: {
			label: "SPF glossary",
			href: "/glossary/spf",
		},
	},
	relatedLinks: [
		{ label: "Auth checker", href: "/tools/auth-checker" },
		{ label: "All free tools", href: "/tools" },
	],
};
