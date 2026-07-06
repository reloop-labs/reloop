import type { LandingPageDefinition } from "../types";

export const config: LandingPageDefinition = {
	slug: "inbound-email",
	path: "/use-cases/inbound-email",
	titleLines: [
		"Inbound",
		"Email API",
	],
	description: "Receive and route inbound email to your app with webhooks, parsing, and mailbox APIs.",
	keywords: [
		"inbound email API",
		"receive email webhook",
		"parse inbound email",
		"email routing API",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Read documentation",
		href: "/docs",
	},
	sections: [
		{
			title: "Process inbound mail",
			items: [
				{
					title: "Inbound webhooks",
					description: "POST parsed email payloads to your app when messages arrive.",
				},
				{
					title: "Mailbox API",
					description: "Programmatic access to threads, attachments, and metadata.",
				},
				{
					title: "Routing rules",
					description: "Route replies, support tickets, and notifications to the right handler.",
				},
			],
		},
	],
	cta: {
		title: "Handle inbound email in your app",
		titleMuted: "Start free today.",
		description: "Send and receive on one platform—no separate inbound vendor.",
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
