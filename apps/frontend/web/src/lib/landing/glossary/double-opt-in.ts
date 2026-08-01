import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "double-opt-in",
	title: "Double Opt-in",
	description:
		"A signup that only counts after the person confirms their address via email.",
	keywords: ["double opt-in","confirmed opt-in","DOI email"],
	body: `Double opt-in (confirmed opt-in) means the user submits an address, then must click a link in a confirmation message before you treat them as subscribed. Single opt-in stops at the form submit.

Confirmed opt-in cuts typos, third-party signups, and “I never asked for this” complaints. It also lowers the number of people who enter someone else's email as a joke. The tradeoff is a smaller list and an extra step some users abandon.

For marketing lists in many regions, confirmed opt-in is the safer default. Transactional mail from product actions is a different category; do not force DOI on password resets.

Reloop can send the confirmation message like any other transactional email when you build the flow in your app.`,
	relatedTerms: [
		{
			slug: "opt-in",
			title: "Opt-in",
		},
		{
			slug: "opt-out",
			title: "Opt-out",
		},
		{
			slug: "list-hygiene",
			title: "List Hygiene",
		},
	],
	relatedFeatureHref: "/features/transaction-emails",
};
