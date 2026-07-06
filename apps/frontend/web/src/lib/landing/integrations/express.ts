import type { LandingPageDefinition } from "../types";

export const config: LandingPageDefinition = {
	slug: "express",
	path: "/integrations/express",
	titleLines: [
		"Send Email",
		"with Express",
	],
	description: "Integrate Reloop into Express.js apps for transactional notifications and auth emails.",
	keywords: [
		"Express email API",
		"Node.js Express transactional email",
		"send email Express.js",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Node.js SDK",
		href: "/features/languages/nodejs",
	},
	sections: [
		{
			title: "Express setup",
			items: [
				{
					title: "Middleware-friendly",
					description: "Send emails from route handlers after auth or payment events.",
				},
				{
					title: "Environment config",
					description: "Store API keys in process.env and initialize once at boot.",
				},
				{
					title: "Webhooks",
					description: "Receive delivery events on Express endpoints for bounce handling.",
				},
			],
		},
	],
	cta: {
		title: "Add email to Express",
		titleMuted: "Start free today.",
		description: "npm install reloop-email and send in minutes.",
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
