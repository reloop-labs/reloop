import type { IconName } from "@reloop/ui/icon";

export type TemplateTabId =
	| "ai-templates"
	| "realtime-editor"
	| "version-history";

export const TEMPLATE_TABS: {
	id: TemplateTabId;
	icon: IconName;
	title: string;
	description: string;
	href: string;
}[] = [
	{
		id: "ai-templates",
		icon: "sparkling",
		title: "AI-powered templates",
		description:
			"Generate complete email layouts from natural-language prompts with reusable components and variables.",
		href: "/features/email-templates#ai-templates",
	},
	{
		id: "realtime-editor",
		icon: "code",
		title: "Real-time editor",
		description:
			"Work directly on your templates with live previews, instant updates, and a shared editing experience.",
		href: "/features/email-templates#editor",
	},
	{
		id: "version-history",
		icon: "history",
		title: "Version history",
		description:
			"Keep a complete history of your changes and restore any previous version when needed.",
		href: "/features/email-templates#version-history",
	},
];
