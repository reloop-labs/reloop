import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "marketing-email",
	title: "Marketing Email",
	description:
		"Promotional or newsletter mail sent to people who opted in, not triggered by a product action.",
	keywords: ["marketing email", "promotional email", "email campaign"],
	body: `Marketing email is bulk or campaign mail: newsletters, launches, offers, nurture sequences. Recipients should have opted in for that kind of content. Transactional mail is different: it reacts to account or product events.

Marketing streams need clear unsubscribe, list hygiene, and careful frequency. Mixing heavy promo design into password resets confuses users and filters.

Keep marketing and transactional identities and consent separate when you can. Reloop can send both, but your product should treat consent and templates as separate concerns.`,
	relatedTerms: [
		{
			slug: "transactional-email",
			title: "Transactional Email",
		},
		{
			slug: "opt-in",
			title: "Opt-in",
		},
		{
			slug: "unsubscribe",
			title: "Unsubscribe",
		},
	],
	relatedFeatureHref: "/pricing",
};
