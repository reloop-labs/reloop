import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "spam-trap",
	title: "Spam Trap",
	description:
		"An address maintained to catch senders who mail without proper consent or hygiene.",
	keywords: ["spam trap","honeypot email","pristine spam trap"],
	body: `Spam traps are addresses that should never receive legitimate opted-in mail. Some are pristine (never used by a human). Others are recycled addresses that lapsed and were converted into traps. Hitting them tells providers your acquisition or hygiene is weak.

You do not get a friendly warning email from the trap owner. You get filtering and list pain. The defense is permission-based growth, regular cleaning, and never buying lists.

If deliverability collapses after an import, suspect traps and bad data in that file. Stop the stream, scrub, and rebuild from confirmed subscribers.`,
	relatedTerms: [
		{
			slug: "list-hygiene",
			title: "List Hygiene",
		},
		{
			slug: "blocklist",
			title: "Blocklist",
		},
		{
			slug: "reputation",
			title: "Reputation",
		},
	],
	relatedFeatureHref: "/features/email-validation",
};
