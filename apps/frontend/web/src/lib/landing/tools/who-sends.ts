import type { ToolDefinition } from "../types";

export const config: ToolDefinition = {
	slug: "who-sends",
	path: "/tools/who-sends",
	toolType: "who-sends",
	titleLines: ["Who Sends Email", "From This Domain?"],
	description:
		"Identify every email service provider (e.g. Google, Amazon SES, SendGrid, Mailchimp) authorized in DNS to send email for a domain, and inspect inbound mailbox routing.",
	keywords: [
		"who sends email from this domain",
		"email stack detector",
		"ESP finder",
		"SPF include analyzer",
		"nested SPF unroller",
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
			title: "Sending roster checks",
			items: [
				{
					title: "Inbound vs Outbound",
					description:
						"Maps mailbox provider against third-party sending services.",
				},
				{
					title: "Nested SPF Unrolling",
					description:
						"Follows branded includes (depth 2) to uncover underlying ESPs.",
				},
				{
					title: "Leftover Vendor Audit",
					description:
						"Flags unused ESP includes without active DKIM keys.",
				},
			],
		},
	],
	cta: {
		title: "Consolidate your sending with Reloop",
		titleMuted: "Start free today.",
		description:
			"Replace multi-vendor ESP sprawl with one developer-first email platform.",
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
