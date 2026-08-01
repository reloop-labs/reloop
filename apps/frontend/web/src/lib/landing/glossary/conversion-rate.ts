import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "conversion-rate",
	title: "Conversion Rate",
	description:
		"The percentage of recipients who completed the action the email was meant to drive.",
	keywords: ["email conversion rate","email CTA conversion"],
	body: `Conversion rate ties email to an outcome: purchase, signup, password reset completed, trial started. The formula is conversions divided by a base (delivered or clicked). Without a defined goal, the metric is noise.

Transactional mail often has a natural conversion: the user finishes the flow the message started. Marketing mail needs clear offers and tracking (UTM parameters, promo codes, or on-site attribution).

If opens look fine and conversions do not, the problem is usually the landing experience or the offer, not the SMTP path.`,
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
