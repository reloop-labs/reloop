import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "open-rate",
	title: "Open Rate",
	description:
		"An estimate of how many recipients opened a message, usually based on tracking pixels.",
	keywords: ["email open rate","open tracking","pixel open rate"],
	body: `Open rate is tracked opens divided by delivered messages (definitions vary). Historically it relied on a tiny image loading when the message was displayed. Apple Mail Privacy Protection and similar features load images up front, which inflates opens and weakens the metric.

Use open rate as a coarse signal, not a precise KPI. Clicks and conversions usually tell you more about real interest. Still, near-zero opens across a large list can mean spam placement or dead addresses.

Reloop can report open events when tracking is enabled; interpret them with privacy changes in mind.`,
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
