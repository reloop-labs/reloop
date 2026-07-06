import type { LandingPageDefinition } from "../types";

export const config: LandingPageDefinition = {
	slug: "payment-receipt-email",
	path: "/use-cases/payment-receipt-email",
	titleLines: [
		"Payment Receipt",
		"Emails",
	],
	description: "Automated receipt and invoice emails for subscriptions, one-time payments, and refunds.",
	keywords: [
		"payment receipt email API",
		"invoice email service",
		"Stripe receipt email",
		"billing email automation",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Stripe integration",
		href: "/integrations/stripe-webhooks",
	},
	sections: [
		{
			title: "Billing communications",
			items: [
				{
					title: "Stripe webhooks",
					description: "Trigger receipt emails from payment.succeeded and invoice.paid events.",
				},
				{
					title: "Subscription renewals",
					description: "Notify customers before and after recurring charges.",
				},
				{
					title: "Refund confirmations",
					description: "Send clear refund receipts to close the loop with customers.",
				},
			],
		},
	],
	cta: {
		title: "Receipts that customers trust",
		titleMuted: "Start free today.",
		description: "Branded templates with full delivery analytics.",
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
