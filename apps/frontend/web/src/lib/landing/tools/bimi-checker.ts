import type { ToolDefinition } from "../types";

export const config: ToolDefinition = {
	slug: "bimi-checker",
	path: "/tools/bimi-checker",
	toolType: "bimi-checker",
	titleLines: ["BIMI", "Checker"],
	description:
		"Look up default._bimi, validate the HTTPS SVG logo and optional VMC, and confirm DMARC is at quarantine or reject.",
	keywords: ["BIMI checker", "BIMI record lookup", "BIMI SVG", "VMC checker"],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "What is BIMI?",
		href: "/glossary/bimi",
	},
	sections: [
		{
			title: "BIMI requirements",
			items: [
				{
					title: "Assertion record",
					description:
						"A TXT record at default._bimi.{domain} with v=BIMI1 and an HTTPS l= logo URL.",
				},
				{
					title: "DMARC enforcement",
					description:
						"p=quarantine or p=reject with pct=100. Monitoring-only DMARC will not show a logo.",
				},
				{
					title: "SVG Tiny PS",
					description:
						"The logo should be a square SVG 1.2 Tiny PS file with no scripts or remote assets.",
				},
			],
		},
	],
	cta: {
		title: "Show your logo in the inbox",
		titleMuted: "Start with DMARC.",
		description:
			"Reloop walks you through SPF, DKIM, and DMARC when you verify a sending domain.",
		primary: {
			label: "Get started free",
			href: "/dashboard/signup",
		},
		secondary: {
			label: "BIMI glossary",
			href: "/glossary/bimi",
		},
	},
	relatedLinks: [
		{
			label: "Auth checker",
			href: "/tools/auth-checker",
		},
		{
			label: "DMARC glossary",
			href: "/glossary/dmarc",
		},
	],
};
