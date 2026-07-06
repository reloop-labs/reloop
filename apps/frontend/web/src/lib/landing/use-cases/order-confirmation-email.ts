import type { LandingPageDefinition } from "../types";

export const config: LandingPageDefinition = {
	slug: "order-confirmation-email",
	path: "/use-cases/order-confirmation-email",
	titleLines: ["Order Confirmation", "Emails"],
	description:
		"Send a polished receipt with line items and totals the second checkout completes — triggered from your order webhook, no extra service needed.",
	keywords: [
		"order confirmation email API",
		"purchase receipt email",
		"ecommerce transactional email",
		"order receipt email service",
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
			title: "E-commerce email",
			items: [
				{
					title: "Dynamic line items",
					description:
						"Render product names, quantities, and prices from your order data.",
				},
				{
					title: "PDF attachments",
					description:
						"Attach invoices and receipts when your flow requires them.",
				},
				{
					title: "High deliverability",
					description:
						"Receipt emails must reach the inbox—authentication and monitoring built in.",
				},
			],
		},
	],
	cta: {
		title: "Confirm every order",
		titleMuted: "Start free today.",
		description: "Integrate with Stripe, Shopify, or your custom checkout.",
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
