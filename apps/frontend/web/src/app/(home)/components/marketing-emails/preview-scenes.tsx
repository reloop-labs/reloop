import type { IconName } from "@reloop/ui/icon";

export type MarketingTabId = "upload-data" | "manage-funnels" | "analytics";

export const MARKETING_TABS: {
	id: MarketingTabId;
	icon: IconName;
	title: string;
	description: string;
	href: string;
}[] = [
	{
		id: "upload-data",
		icon: "file-code",
		title: "Upload data",
		description:
			"Import audiences from CSV, REST API, or live database sync with flexible traits and tags.",
		href: "/features/marketing#upload-data",
	},
	{
		id: "manage-funnels",
		icon: "workflow",
		title: "Manage funnels",
		description:
			"Design multi-step journeys with conditional branches, triggers, and personalized flows.",
		href: "/features/marketing#funnels",
	},
	{
		id: "analytics",
		icon: "chart-bar",
		title: "Analytics",
		description:
			"Monitor delivery, engagement, conversions, and revenue impact with real-time insights.",
		href: "/features/marketing#analytics",
	},
];
