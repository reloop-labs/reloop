import type { ToolDefinition } from "../types";

export const config: ToolDefinition = {
	slug: "auth-checker",
	path: "/tools/auth-checker",
	toolType: "auth-checker",
	titleLines: [
		"SPF, DKIM &",
		"DMARC Checker",
	],
	description: "Verify email authentication records for your domain. Ensure SPF, DKIM, and DMARC are configured correctly.",
	keywords: [
		"SPF checker",
		"DKIM validator",
		"DMARC checker",
		"email authentication checker",
		"SPF DKIM DMARC test",
	],
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
			title: "Authentication records",
			items: [
				{
					title: "SPF",
					description: "Lists which servers are authorized to send email for your domain.",
				},
				{
					title: "DKIM",
					description: "Cryptographic signatures that prove messages weren't tampered with in transit.",
				},
				{
					title: "DMARC",
					description: "Policy that tells receivers how to handle messages that fail SPF or DKIM.",
				},
			],
		},
	],
	cta: {
		title: "Auto-configure auth in Reloop",
		titleMuted: "Start free today.",
		description: "Guided DNS setup for SPF, DKIM, and DMARC when you add a domain.",
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
			label: "SPF glossary",
			href: "/glossary/spf",
		},
		{
			label: "DKIM glossary",
			href: "/glossary/dkim",
		},
		{
			label: "DMARC glossary",
			href: "/glossary/dmarc",
		},
	],
};
