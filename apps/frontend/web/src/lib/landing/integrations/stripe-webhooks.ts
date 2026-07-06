import type { LandingPageDefinition } from "../types";

export const config: LandingPageDefinition = {
	slug: "stripe-webhooks",
	path: "/integrations/stripe-webhooks",
	titleLines: ["Stripe Receipt", "Emails"],
	description:
		"Send payment receipts, invoices, and subscription emails triggered by Stripe webhooks.",
	keywords: [
		"Stripe receipt email",
		"Stripe webhook email",
		"Stripe invoice email",
		"billing email Stripe",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Payment receipts",
		href: "/use-cases/payment-receipt-email",
	},
	sections: [
		{
			title: "Stripe event triggers",
			items: [
				{
					title: "payment_intent.succeeded",
					description: "Send branded receipts when one-time payments complete.",
				},
				{
					title: "invoice.paid",
					description:
						"Email subscription invoices with line items and PDF links.",
				},
				{
					title: "customer.subscription.updated",
					description: "Notify customers of plan changes and renewals.",
				},
			],
		},
	],
	cta: {
		title: "Stripe billing emails",
		titleMuted: "Start free today.",
		description: "Webhook handler + Reloop API = receipts in minutes.",
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
