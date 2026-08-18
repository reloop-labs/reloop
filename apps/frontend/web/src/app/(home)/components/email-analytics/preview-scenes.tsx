import type { IconName } from "@reloop/ui/icon";

export type AnalyticsTabId = "metrics" | "engagement" | "bounces";

export const ANALYTICS_TABS: {
	id: AnalyticsTabId;
	icon: IconName;
	title: string;
	description: string;
	href: string;
}[] = [
	{
		id: "metrics",
		icon: "graph-up",
		title: "Metrics",
		description:
			"Track deliverability, reputation, and sent volumes with real-time domain breakdown.",
		href: "/docs/analytics",
	},
	{
		id: "engagement",
		icon: "cursor-click",
		title: "Engagement & clicks",
		description:
			"Monitor live open rates, unique click heatmaps, and recipient device distribution as they happen.",
		href: "/docs/analytics/engagement",
	},
	{
		id: "bounces",
		icon: "alert-triangle",
		title: "Bounces & Diagnostics",
		description:
			"Inspect hard/soft bounce causes, spam complaints, and raw SMTP server return codes.",
		href: "/docs/analytics/deliverability",
	},
];
