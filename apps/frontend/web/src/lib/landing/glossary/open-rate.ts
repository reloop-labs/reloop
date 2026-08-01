import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "open-rate",
	title: "Open Rate",
	description:
		"A rough estimate of how many people opened a message, usually from tracking pixels.",
	keywords: ["email open rate","open tracking","pixel open rate"],
	body: `Open rate is tracked opens divided by delivered messages (definitions vary). Historically it relied on a tiny image loading when the message was displayed. Apple Mail Privacy Protection and similar features load images up front, which inflates opens and weakens the metric.

Use opens as a soft signal, not a precise KPI. Combine with clicks, replies, and conversions. Compare trends more than absolute percentages across industries.

Reloop can report open events when tracking is enabled, with the same privacy caveats every modern sender faces.`,
	relatedTerms: [
		{
			slug: "tracking-pixel",
			title: "Tracking Pixel",
		},
		{
			slug: "click-through-rate",
			title: "Click-through Rate",
		},
		{
			slug: "engagement",
			title: "Engagement",
		},
	],
	relatedFeatureHref: "/features/email-analytics",
};
