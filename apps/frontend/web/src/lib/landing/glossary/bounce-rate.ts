import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "bounce-rate",
	title: "Bounce Rate",
	description:
		"The percentage of emails that could not be delivered to recipients.",
	keywords: ["email bounce rate", "bounce rate definition"],
	body: "High bounce rates damage sender reputation. Hard bounces (permanent failures) should be removed from lists immediately. Reloop reports bounces via webhooks and analytics so you can keep lists clean.",
	relatedTerms: [
		{
			slug: "hard-bounce",
			title: "Hard Bounce",
		},
		{
			slug: "soft-bounce",
			title: "Soft Bounce",
		},
	],
	relatedFeatureHref: "/features/email-validation",
};
