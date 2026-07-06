import type { LandingPageDefinition } from "../types";

export const config: LandingPageDefinition = {
	slug: "email-verification",
	path: "/use-cases/email-verification",
	titleLines: [
		"Email Verification",
		"API",
	],
	description: "Send verification links and OTP emails to confirm user email addresses at signup.",
	keywords: [
		"email verification API",
		"verify email address API",
		"confirmation email service",
		"email OTP API",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Email validation",
		href: "/features/email-validation",
	},
	sections: [
		{
			title: "Verify at signup",
			items: [
				{
					title: "Magic links",
					description: "Send one-click verification links with expiring tokens.",
				},
				{
					title: "OTP codes",
					description: "Deliver numeric codes for two-step verification flows.",
				},
				{
					title: "Validate first",
					description: "Combine with address validation to block typos before sending.",
				},
			],
		},
	],
	cta: {
		title: "Verify users reliably",
		titleMuted: "Start free today.",
		description: "Fast delivery and webhooks for verified, bounced, and failed sends.",
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
