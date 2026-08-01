import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "conversion-rate",
	title: "Conversion Rate",
	description:
		"The percentage of recipients who completed the action the email was meant to drive.",
	keywords: ["email conversion rate","email CTA conversion"],
	body: `Conversion rate ties email to an outcome: purchase, signup, finished password reset, trial started. The formula is conversions divided by a base (delivered or clicked). Without a clear goal, the metric is noise.

Transactional mail often has a natural conversion: the user finishes the task the message started. Marketing mail needs tracking (UTMs, deep links, promo codes) so you can attribute results back to the send.

Compare conversion across segments and templates, not just absolute numbers. A smaller list that acts is worth more than a huge list that ignores you.`,
	relatedTerms: [
		{
			slug: "click-through-rate",
			title: "Click-through Rate",
		},
		{
			slug: "open-rate",
			title: "Open Rate",
		},
		{
			slug: "transactional-email",
			title: "Transactional Email",
		},
	],
	relatedFeatureHref: "/features/email-analytics",
};
