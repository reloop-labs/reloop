import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "hard-bounce",
	title: "Hard Bounce",
	description:
		"A permanent delivery failure: the address or domain cannot receive the message.",
	keywords: ["hard bounce","permanent bounce","user unknown"],
	body: `A hard bounce means the receiver says this will not work later either: user unknown, domain does not exist, address rejected as invalid. Soft bounces are temporary; hard bounces are permanent.

Suppress hard-bounced addresses right away. Mailing them again signals poor list hygiene and hurts reputation. Do not re-import old CSV dumps without cleaning.

Reloop marks hard bounces in events and analytics so your app can stop mailing those addresses automatically.`,
	relatedTerms: [
		{
			slug: "soft-bounce",
			title: "Soft Bounce",
		},
		{
			slug: "bounce",
			title: "Bounce",
		},
		{
			slug: "suppression-list",
			title: "Suppression List",
		},
	],
	relatedFeatureHref: "/features/email-analytics",
};
