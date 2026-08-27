import type { ToolDefinition } from "../types";

export const config: ToolDefinition = {
	slug: "dkim-generator",
	path: "/tools/dkim-generator",
	toolType: "dkim-generator",
	titleLines: ["DKIM Record", "Generator"],
	description:
		"Generate a 2048-bit RSA DKIM key pair and the TXT record at {selector}._domainkey.{domain}. The private key is returned once and never stored.",
	keywords: ["DKIM generator", "DKIM key pair", "DKIM TXT"],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "What is DKIM?",
		href: "/glossary/dkim",
	},
	sections: [
		{
			title: "DKIM keys",
			items: [
				{
					title: "Selector",
					description:
						"The public key lives at {selector}._domainkey.{domain}. Multiple selectors let you run more than one signer.",
				},
				{
					title: "2048-bit RSA",
					description:
						"The generator creates a PKCS#8 private key and an SPKI public key encoded for the p= tag.",
				},
				{
					title: "Private key",
					description:
						"Shown in the API response only. Reloop does not log or persist it.",
				},
			],
		},
	],
	cta: {
		title: "Let Reloop mint DKIM for you",
		titleMuted: "Start free today.",
		description:
			"Domain verification generates keys and shows the exact DNS records to publish.",
		primary: {
			label: "Get started free",
			href: "/dashboard/signup",
		},
		secondary: {
			label: "DKIM glossary",
			href: "/glossary/dkim",
		},
	},
	relatedLinks: [
		{ label: "Auth checker", href: "/tools/auth-checker" },
		{ label: "All free tools", href: "/tools" },
	],
};
