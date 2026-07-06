import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "authentication",
	title: "Email Authentication",
	description: "The process of verifying email sender identity using SPF, DKIM, and DMARC.",
	keywords: [
		"email authentication",
		"sender authentication",
		"email auth",
	],
	body: "Email authentication proves to receiving servers that your messages are legitimate. Without SPF, DKIM, and DMARC, emails are more likely to land in spam. Reloop guides you through DNS setup when you add a sending domain.",
	relatedTerms: [
		{
			slug: "spf",
			title: "SPF",
		},
		{
			slug: "dkim",
			title: "DKIM",
		},
		{
			slug: "dmarc",
			title: "DMARC",
		},
	],
	relatedFeatureHref: "/features/deliverability",
};
