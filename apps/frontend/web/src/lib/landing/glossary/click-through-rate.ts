import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "click-through-rate",
	title: "Click-through Rate",
	description:
		"The percentage of recipients who clicked a tracked link in the email.",
	keywords: ["CTR email","email click rate","click-through rate"],
	body: `Click-through rate (CTR) is clicks divided by a base you choose: usually delivered messages, sometimes opens. Marketing teams use it to compare subject lines, offers, and layouts. Product teams care less for pure transactional mail, where the “click” is finishing a reset or confirming an action.

Tracked links rewrite URLs through your ESP so clicks can be counted. Privacy features and security gateways that prefetch links can inflate numbers. Treat CTR as a directional metric, not lab-grade data.

If clicks are the goal, fix relevance and placement first. One clear primary button beats five competing links.`,
	relatedTerms: [
		{
			slug: "open-rate",
			title: "Open Rate",
		},
		{
			slug: "conversion-rate",
			title: "Conversion Rate",
		},
		{
			slug: "tracking-pixel",
			title: "Tracking Pixel",
		},
	],
	relatedFeatureHref: "/features/email-analytics",
};
