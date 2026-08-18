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
			"Generate complete, responsive email layouts from simple natural-language prompts.",
		href: "/features/email-templates#ai-templates",
	},
	{
		id: "realtime-editor",
		icon: "code",
		title: "Real-time editor",
		description:
			"Edit layouts, content, and variables with live previews and instant updates.",
		href: "/features/email-templates#editor",
	},
	{
		id: "version-history",
		icon: "history",
		title: "Version history",
		description:
			"Review changes, compare revisions, and restore any previous version in seconds.",
		href: "/features/email-templates#version-history",
	},
];
