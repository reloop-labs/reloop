import type { IconName } from "@reloop/ui/icon";

export type AnalyticsTabId = "deliverability" | "engagement" | "bounces";

export const ANALYTICS_TABS: {
	id: AnalyticsTabId;
	icon: IconName;
	title: string;
	description: string;
	href: string;
}[] = [
	{
		id: "deliverability",
		icon: "graph-up",
		title: "Deliverability Metrics",
		description:
			"Track delivery rates, ISP breakdown, and 99.9% inbox placement trends in real time.",
		href: "/docs/analytics",
	},
	{
		id: "engagement",
		icon: "cursor-click",
		title: "Engagement & Clicks",
		description:
			"Monitor live open rates, unique click heatmaps, and device distribution as they happen.",
		href: "/docs/analytics/engagement",
	},
	{
		id: "bounces",
		icon: "alert-triangle",
		title: "Bounce & Diagnostics",
		description:
			"Inspect hard/soft bounce causes, spam complaints, and raw SMTP server return codes.",
		href: "/docs/analytics/deliverability",
	},
];
