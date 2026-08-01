import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "double-opt-in",
	title: "Double Opt-in",
	description:
		"A signup flow that requires a confirmation email click before the address is fully subscribed.",
	keywords: ["double opt-in","confirmed opt-in","DOI email"],
	body: `Double opt-in (confirmed opt-in) means the user submits an address, then must click a link in a confirmation message before you treat them as subscribed. Single opt-in stops at the form submit.

Confirmed opt-in cuts typos, malicious third-party signups, and “I never asked for this” complaints. It also lowers the number of people who enter someone else's email as a joke. The tradeoff is a smaller list and an extra step that some users abandon.

For marketing lists in many regions, confirmed opt-in is the safer default. Transactional mail triggered by product actions is a different legal and product category; do not force DOI on password resets.

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
