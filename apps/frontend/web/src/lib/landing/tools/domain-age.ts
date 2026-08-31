import type { ToolDefinition } from "../types";

export const config: ToolDefinition = {
	slug: "domain-age",
	path: "/tools/domain-age",
	toolType: "domain-age",
	titleLines: ["Domain Age &", "Warmup Checker"],
	description:
		"Check domain registration age via authoritative RDAP and evaluate newly registered domain (NRD) spam filter risks before sending email.",
	keywords: [
		"domain age checker",
		"email warmup checker",
		"check domain registration date",
		"newly registered domain spam risk",
		"cold domain email deliverability",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Email Warmup Guide",
		href: "/docs",
	},
	sections: [
		{
			title: "Domain age & warmup checks",
			items: [
				{
					title: "RDAP Registration Date",
					description:
						"Queries official ICANN registries for authoritative domain creation timestamps.",
				},
				{
					title: "Warmup Stage Timeline",
					description:
						"Classifies sending readiness into Too New (0–7d), Cold (8–30d), Warming (31–90d), and Established.",
				},
				{
					title: "Authentication Alignment",
					description:
						"Separates registration age from SPF, DKIM, and DMARC DNS health.",
				},
			],
		},
	],
	cta: {
		title: "Warm up your domains with Reloop",
		titleMuted: "Start free today.",
		description:
			"Build sender reputation safely with automated volume ramps and deliverability monitoring.",
		primary: {
			label: "Get started free",
			href: "/dashboard/signup",
		},
		secondary: {
			label: "Read documentation",
			href: "/docs",
		},
	},
};
