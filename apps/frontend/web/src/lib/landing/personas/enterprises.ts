import type { LandingPageDefinition } from "../types";

export const config: LandingPageDefinition = {
	slug: "enterprises",
	path: "/enterprises",
	titleLines: ["Email for", "Enterprise"],
	description:
		"Self-hosted email infrastructure for data residency, compliance, and control at scale.",
	keywords: [
		"enterprise email infrastructure",
		"self-hosted enterprise email",
		"email data residency",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Self-hosting guide",
		href: "/docs/self-host",
	},
	sections: [
		{
			title: "Enterprise requirements",
			items: [
				{
					title: "Self-hosting",
					description: "Deploy on your VPC with Docker Compose or Kubernetes.",
				},
				{
					title: "Open source audit",
					description: "Security teams can review Apache 2.0 source code.",
				},
				{
					title: "Full stack",
					description:
						"Transactional, campaigns, SMTP, webhooks, and analytics.",
				},
			],
		},
	],
	cta: {
		title: "Own your email stack",
		titleMuted: "Start free today.",
		description:
			"Hosted or self-hosted—same product, your infrastructure choice.",
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
