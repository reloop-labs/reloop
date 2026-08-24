import type { ToolDefinition } from "../types";

export const config: ToolDefinition = {
	slug: "temp-email-checker",
	path: "/tools/temp-email-checker",
	toolType: "temp-email-checker",
	titleLines: ["Temp & Disposable", "Email Checker"],
	description:
		"Check syntax, known disposable providers, role prefixes, and MX records before an address hits your database. We do not probe the mailbox.",
	keywords: [
		"temp email checker",
		"disposable email checker",
		"burner email address",
		"fake email detector",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Email Validation API",
		href: "/features/email-validation",
	},
	sections: [
		{
			title: "Why check disposable emails",
			items: [
				{
					title: "Prevent Hard Bounces",
					description:
						"Throwaway inboxes expire within hours, turning into hard bounces that degrade sender reputation.",
				},
				{
					title: "Protect Signups & Fraud",
					description:
						"Block automated bot signups and free-tier abuse by detecting throwaway domains in real time.",
				},
			],
		},
	],
	cta: {
		title: "Validate emails in real time",
		titleMuted: "Start free today.",
		description:
			"Use Reloop's validation API to protect your signup forms and import lists.",
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
