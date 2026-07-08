import type { ToolDefinition } from "../types";

export const config: ToolDefinition = {
	slug: "template-generator",
	path: "/tools/template-generator",
	toolType: "template-generator",
	titleLines: ["Email Template", "Generator"],
	description:
		"Generate responsive HTML email templates for newsletters, transactional messages, and welcome emails.",
	keywords: [
		"email template generator",
		"HTML email template",
		"responsive email template",
		"email HTML builder",
		"transactional email template",
	],
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Email Templates",
		href: "/features/email-templates",
	},
	sections: [
		{
			title: "Template types",
			items: [
				{
					title: "Newsletter",
					description:
						"Multi-section layouts with hero, body, and footer blocks for regular campaigns.",
				},
				{
					title: "Transactional",
					description:
						"Clean, minimal templates for receipts, resets, and account notifications.",
				},
				{
					title: "Welcome",
					description:
						"Onboarding emails with clear CTAs and brand-friendly structure.",
				},
			],
		},
	],
	cta: {
		title: "Design templates in Reloop",
		titleMuted: "Start free today.",
		description:
			"Use the visual template editor and campaign builder in the dashboard.",
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
			label: "Email Templates",
			href: "/features/email-templates",
		},
		{
			label: "AI Agents",
			href: "/features/ai-agents",
		},
	],
};
