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
			"Track deliverability, reputation, and sent volume with clear domain-level insights.",
		href: "/docs/analytics",
	},
	{
		id: "engagement",
		icon: "cursor-click",
		title: "Engagement & clicks",
		description:
			"Monitor opens, clicks, and recipient behavior with live engagement analytics.",
		href: "/docs/analytics/engagement",
	},
	{
		id: "bounces",
		icon: "alert-triangle",
		title: "Bounces & Diagnostics",
		description:
			"Inspect bounce causes, spam complaints, and raw SMTP responses to debug issues.",
		href: "/docs/analytics/deliverability",
	},
];
