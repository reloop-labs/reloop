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
			"Import audiences seamlessly via CSV, REST API, or live database sync with custom traits and tags.",
		href: "/features/marketing#upload-data",
	},
	{
		id: "manage-funnels",
		icon: "workflow",
		title: "Manage funnels",
		description:
			"Design multi-step automation journeys, conditional branch triggers, and personalized drip flows.",
		href: "/features/marketing#funnels",
	},
	{
		id: "analytics",
		icon: "chart-bar",
		title: "Analytics",
		description:
			"Track real-time delivery, engagement heatmaps, conversion rates, and revenue impact across campaigns.",
		href: "/features/marketing#analytics",
	},
];
