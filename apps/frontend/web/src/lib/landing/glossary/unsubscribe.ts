import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "unsubscribe",
	title: "Unsubscribe",
	description:
		"Stopping marketing mail for a recipient and recording that preference for future sends.",
	keywords: ["unsubscribe", "email unsubscribe", "opt out email"],
	body: `Unsubscribe is both a user action and a backend state change. The person clicks a link or uses one-click list-unsubscribe; your systems mark them suppressed for that list or for all marketing.

Speed matters. Slow unsubscribe pages that ask long surveys cause spam complaints. Confirm the result clearly. Apply the change everywhere you send from.

Transactional mail may continue when appropriate. Say so carefully in copy if users might be confused (“you will still get security alerts”).`,
	relatedTerms: [
		{
			slug: "list-unsubscribe",
			title: "List-Unsubscribe",
		},
		{
			slug: "opt-out",
			title: "Opt-out",
		},
		{
			slug: "suppression-list",
			title: "Suppression List",
		},
	],
	relatedFeatureHref: "/docs",
};
