import type { ToolDefinition } from "../types";

export const config: ToolDefinition = {
	slug: "dmarc-generator",
	path: "/tools/dmarc-generator",
	toolType: "dmarc-generator",
	titleLines: ["DMARC Record", "Generator"],
	description:
		"Build a _dmarc TXT record with policy, rua/ruf reporting, alignment, pct, and subdomain policy.",
	keywords: ["DMARC generator", "DMARC wizard", "create DMARC record"],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "What is DMARC?",
		href: "/glossary/dmarc",
	},
	sections: [
		{
			title: "DMARC policy",
			items: [
				{
					title: "p=",
					description:
						"none monitors, quarantine asks receivers to junk failures, reject asks them to refuse the message.",
				},
				{
					title: "rua=",
					description:
						"Aggregate reports show who sends as your domain. Start here before raising policy.",
				},
				{
					title: "pct and sp",
					description:
						"pct phases in enforcement. sp sets policy for subdomains. BIMI needs pct=100.",
				},
			],
		},
	],
	cta: {
		title: "Tighten DMARC with Reloop",
		titleMuted: "Start free today.",
		description:
			"Verify a domain and Reloop shows the SPF, DKIM, and DMARC records to publish.",
		primary: {
			label: "Get started free",
			href: "/dashboard/signup",
		},
		secondary: {
			label: "DMARC glossary",
			href: "/glossary/dmarc",
		},
	},
	relatedLinks: [
		{ label: "BIMI checker", href: "/tools/bimi-checker" },
		{ label: "Auth checker", href: "/tools/auth-checker" },
	],
};
