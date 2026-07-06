import type { ToolDefinition } from "../types";

export const config: ToolDefinition = {
	slug: "mobile-preview",
	path: "/tools/mobile-preview",
	toolType: "mobile-preview",
	titleLines: [
		"Email Mobile",
		"Preview",
	],
	description: "Preview how your HTML email renders on mobile devices before you send.",
	keywords: [
		"email mobile preview",
		"email client preview",
		"responsive email preview",
		"email rendering test",
		"mobile email tester",
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
			title: "Preview across clients",
			items: [
				{
					title: "Mobile viewport",
					description: "See how your email looks on narrow screens where most opens happen.",
				},
				{
					title: "Responsive checks",
					description: "Catch broken layouts, oversized images, and unreadable font sizes.",
				},
				{
					title: "Before you send",
					description: "Fix rendering issues before they reach customers' inboxes.",
				},
			],
		},
	],
	cta: {
		title: "Send with confidence",
		titleMuted: "Start free today.",
		description: "Design responsive templates and preview campaigns in the Reloop dashboard.",
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
			label: "Template Generator",
			href: "/tools/template-generator",
		},
		{
			label: "Campaign Builder",
			href: "/features/campaign-builder",
		},
	],
};
