import type { ToolDefinition } from "../types";

export const config: ToolDefinition = {
	slug: "email-validator",
	path: "/tools/email-validator",
	toolType: "email-validator",
	titleLines: ["Free Email", "Validator"],
	description:
		"Check email deliverability health instantly. Verify syntax, disposable domains, role addresses, and active MX records for single addresses or upload up to 1,000 emails via CSV.",
	keywords: [
		"email health checker",
		"email validator",
		"verify email list",
		"disposable email detector",
		"bulk email verifier",
		"check mx records",
		"free email checker",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Validation API",
		href: "/features/email-validation",
	},
	sections: [
		{
			title: "Why validate before sending",
			description:
				"Invalid addresses hurt deliverability and waste quota. Catch problems at signup, import, or send time.",
			items: [
				{
					title: "Syntax checks",
					description:
						"RFC-compliant format validation catches typos and malformed addresses before they hit your list.",
				},
				{
					title: "Domain checks",
					description:
						"Verify the domain exists and has valid MX records so you don't send to dead domains.",
				},
				{
					title: "List hygiene",
					description:
						"Clean lists before campaigns to protect sender reputation and reduce bounce rates.",
				},
			],
		},
	],
	cta: {
		title: "Validate at scale",
		titleMuted: "Start free today.",
		description:
			"Use Reloop's validation API in your signup forms and import flows.",
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
			label: "Email Validation feature",
			href: "/features/email-validation",
		},
		{
			label: "All free tools",
			href: "/tools",
		},
	],
};
