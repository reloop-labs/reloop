import type { IconName } from "@reloop/ui/icon";

export type TemplateTabId = "prompt" | "canvas" | "variables";

export const TEMPLATE_TABS: {
	id: TemplateTabId;
	icon: IconName;
	title: string;
	description: string;
	href: string;
}[] = [
	{
		id: "prompt",
		icon: "sparkling",
		title: "Prompt to Template",
		description:
			"Describe any email flow in natural language. Reloop generates production-ready React Email and responsive HTML.",
		href: "/features/email-templates#ai-prompt",
	},
	{
		id: "canvas",
		icon: "layout",
		title: "Visual Canvas & Preview",
		description:
			"Customize typography, padding, brand colors, and layout components visually with instant mobile and desktop views.",
		href: "/features/email-templates#visual-editor",
	},
	{
		id: "variables",
		icon: "modules",
		title: "Variables & Components",
		description:
			"Inject typed TypeScript props, personalization variables, and reusable design system modules into every message.",
		href: "/features/email-templates#components",
	},
];
