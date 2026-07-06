import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "hard-bounce",
	title: "Hard Bounce",
	description: "A permanent delivery failure due to invalid addresses or blocked domains.",
	keywords: [
		"hard bounce",
		"hard bounce email",
	],
	body: "Hard bounces should never be retried. Reloop webhook events let you automatically suppress hard-bounced addresses.",
	relatedTerms: [
		{
			slug: "soft-bounce",
			title: "Soft Bounce",
		},
	],
};
