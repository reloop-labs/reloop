import type { LandingPageDefinition } from "../types";

export const config: LandingPageDefinition = {
	slug: "transactional-email",
	path: "/use-cases/transactional-email",
	titleLines: ["Transactional", "Email API"],
	description:
		"Send password resets, receipts, and real-time notifications with low-latency delivery and delivery tracking.",
	keywords: [
		"transactional email API",
		"transactional email service",
		"send transactional email",
		"transactional email platform",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Transactional docs",
		href: "/features/transaction-emails",
	},
	sections: [
		{
			title: "Built for critical sends",
			items: [
				{
					title: "Sub-second delivery",
					description:
						"Low-latency API and SMTP relay for time-sensitive notifications.",
				},
				{
					title: "Delivery events",
					description:
						"Webhooks for delivered, bounced, and deferred events to keep your app in sync.",
				},
				{
					title: "Templates & variables",
					description:
						"Reusable templates with dynamic content for every transactional type.",
				},
			],
		},
	],
	cta: {
		title: "Send your first transactional email",
		titleMuted: "Start free today.",
		description: "Sign up free and send via API, SDK, or SMTP in minutes.",
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
			label: "Password reset emails",
			href: "/use-cases/password-reset-email",
		},
		{
			label: "Order confirmations",
			href: "/use-cases/order-confirmation-email",
		},
	],
};
