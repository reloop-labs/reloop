import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "spam-trap",
	title: "Spam Trap",
	description:
		"An address maintained to catch senders who mail without proper consent or list hygiene.",
	keywords: ["spam trap","honeypot email","pristine spam trap"],
	body: `Spam traps are addresses that should never receive legitimate opted-in mail. Some are pristine (never used by a human). Others are recycled addresses that lapsed and were converted into traps. Hitting them tells providers your acquisition or hygiene is weak.

You do not get a friendly warning email when you hit a trap. You see reputation damage and placement drops. Avoid purchased lists, scrape sources, and ancient uncleaned databases.

Keep signup clean, confirm opt-in where it makes sense, and sunset inactive addresses. Reloop validation and bounce handling reduce accidental sends to dead addresses, but consent is still your job.`,
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
