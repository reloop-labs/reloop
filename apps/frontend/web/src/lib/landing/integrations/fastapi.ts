import type { LandingPageDefinition } from "../types";

export const config: LandingPageDefinition = {
	slug: "fastapi",
	path: "/integrations/fastapi",
	titleLines: ["Send Email", "with FastAPI"],
	description:
		"Async email sending from FastAPI with the Reloop Python client.",
	keywords: [
		"FastAPI email",
		"FastAPI transactional email",
		"async email Python",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Python SDK",
		href: "/features/languages/python",
	},
	sections: [
		{
			title: "Async-first email",
			items: [
				{
					title: "Background tasks",
					description:
						"Send email in FastAPI BackgroundTasks without blocking responses.",
				},
				{
					title: "Dependency injection",
					description:
						"Initialize the Reloop client once and inject into route handlers.",
				},
				{
					title: "Webhooks",
					description: "Handle delivery events on dedicated FastAPI routes.",
				},
			],
		},
	],
	cta: {
		title: "FastAPI email integration",
		titleMuted: "Start free today.",
		description: "Type-hinted Python client with async support.",
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
