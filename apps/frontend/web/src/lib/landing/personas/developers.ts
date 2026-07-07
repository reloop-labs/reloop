import type { LandingPageDefinition } from "../types";

export const config: LandingPageDefinition = {
	slug: "developers",
	path: "/developers",
	titleLines: ["Email for", "Developers"],
	description:
		"API-first email infrastructure with type-safe SDKs, webhooks, sandbox, and docs built for shipping code.",
	keywords: [
		"email API for developers",
		"developer email infrastructure",
		"email SDK",
		"developer-first email",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "API Reference",
		href: "/features/api-reference",
	},
	sections: [
		{
			title: "Built for builders",
			items: [
				{
					title: "Official SDKs",
					description:
						"Node, Python, Go, Rust, PHP, Ruby, Elixir, Java, and .NET.",
				},
				{
					title: "Real-time logs",
					description:
						"Trace deliveries, bounces, and latencies in the dashboard.",
				},
				{
					title: "Open source",
					description: "Read the code, contribute, or self-host on your stack.",
				},
			],
		},
	],
	cta: {
		title: "Ship email like you ship features",
		titleMuted: "Start free today.",
		description: "Free tier, sandbox mode, and copy-paste quickstarts.",
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
			label: "Developers feature page",
			href: "/features/developers",
		},
		{
			label: "SDKs",
			href: "/docs/resources/sdks",
		},
	],
};
