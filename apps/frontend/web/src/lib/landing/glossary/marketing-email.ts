import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "marketing-email",
	title: "Marketing Email",
	description:
		"Bulk or promotional messages sent to a list for news, offers, or product updates.",
	keywords: ["marketing email","promotional email","email campaign"],
	body: `Marketing email is permission-based bulk mail: newsletters, launches, promotions, nurture sequences. It is not the same as transactional mail that a user action triggers (receipts, resets). Laws and provider rules treat them differently; so should your templates and lists.

Good marketing mail has a clear reason to exist, an obvious unsubscribe path, and segments that match interest. Bad marketing mail is purchased lists, vague “updates,” and Friday night blasts to everyone who ever signed up for a whitepaper.

Reloop supports campaign-style sending alongside transactional traffic. Keep the streams conceptually separate even when one platform handles both.`,
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
