"use client";

import { FeatureSection } from "./feature-section";
import type { FeatureData, FeatureSectionProps } from "./types";
import { DeliverabilityVisual } from "./visuals";

const insightsData: FeatureData = {
	label: "insights",
	title: "Stop guessing about your deliverability",
	description:
		"Get the peace of mind that your emails are actually reaching your customers. Reloop tracks every bounce, click, and spam complaint in real-time, helping you maintain a perfect sender score effortlessly.",
	visual: DeliverabilityVisual,
	bgImage:
		"https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=2070",
	cards: [
		{
			title: "Know your score",
			description:
				"Deep insights into your sender reputation across every major ISP so you always know where you stand.",
		},
		{
			title: "Bypass the spam folder",
			description:
				"Our automated checks ensure your content meets the highest standards before it ever reaches an inbox.",
		},
		{
			title: "Instant Alerts",
			description:
				"Get notified the moment something goes wrong, allowing you to fix issues before they impact your users.",
		},
	],
};

export function InsightsSection({ index, forwardRef, isLast }: Omit<FeatureSectionProps, "feature">) {
	return (
		<FeatureSection
			feature={insightsData}
			index={index}
			forwardRef={forwardRef}
			isLast={isLast}
		/>
	);
}
