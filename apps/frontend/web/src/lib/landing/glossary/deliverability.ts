import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "deliverability",
	title: "Deliverability",
	description:
		"The ability of email to reach the inbox without being filtered as spam.",
	keywords: ["email deliverability", "inbox deliverability"],
	body: "Deliverability depends on authentication, reputation, content, and list quality. Reloop includes spam testing, reputation monitoring, and auth setup to maximize inbox placement.",
	relatedTerms: [
		{
			slug: "spf",
			title: "SPF",
		},
		{
			slug: "reputation",
			title: "Reputation",
		},
	],
	relatedFeatureHref: "/features/deliverability",
};
