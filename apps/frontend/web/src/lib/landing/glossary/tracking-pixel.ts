import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "tracking-pixel",
	title: "Tracking Pixel",
	description:
		"A tiny image in HTML email used to detect when a message is displayed.",
	keywords: ["tracking pixel", "open pixel", "email beacon"],
	body: `A tracking pixel is usually a 1×1 image whose URL is unique per recipient or message. When the client loads remote images, your server logs an open. Many clients block images by default or prefetch them for privacy, so the signal is noisy.

Some places and products require disclosure of tracking. Product and marketing teams should know what they measure and why.

Clicks are often more reliable than opens for decisions after privacy changes. Reloop can emit open events when pixel tracking is enabled in your configuration.`,
	relatedTerms: [
		{
			slug: "open-rate",
			title: "Open Rate",
		},
		{
			slug: "click-through-rate",
			title: "Click-through Rate",
		},
		{
			slug: "email-client",
			title: "Email Client",
		},
	],
	relatedFeatureHref: "/features/email-analytics",
};
