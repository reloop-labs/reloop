import type { LandingPageDefinition } from "../types";

export const config: LandingPageDefinition = {
	slug: "agencies",
	path: "/for/agencies",
	titleLines: ["Email for", "Agencies"],
	description:
		"Manage email infrastructure for multiple clients with domains, templates, and deliverability tools.",
	keywords: [
		"email for agencies",
		"white label email",
		"multi-client email platform",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Contact sales",
		href: "/company/contact-us",
	},
	sections: [
		{
			title: "Multi-client email",
			items: [
				{
					title: "Per-client domains",
					description:
						"Verify and manage DNS for each client's sending domain.",
				},
				{
					title: "Template library",
					description: "Reusable templates across client campaigns.",
				},
				{
					title: "Analytics",
					description:
						"Per-domain reporting for client deliverability reviews.",
				},
			],
		},
	],
	cta: {
		title: "Email infra your clients can trust",
		titleMuted: "Start free today.",
		description: "Deliverability monitoring and branded templates.",
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
