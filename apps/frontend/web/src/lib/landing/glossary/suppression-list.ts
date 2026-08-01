import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "suppression-list",
	title: "Suppression List",
	description:
		"Addresses you must not mail: unsubscribes, complainers, hard bounces, and manual blocks.",
	keywords: ["suppression list","email suppression","do not email list"],
	body: `A suppression list is the set of addresses excluded from sends no matter what the campaign audience says. It includes unsubscribes, spam complainers, hard bounces, and sometimes legal or manual blocks.

Every sending path must consult the same suppressions. The usual failure mode is a new tool that mails “the CRM export” and skips the ESP suppression table.

Keep suppressions durable. Someone who unsubscribed last year should not reappear after a marketing automation migration. Reloop events should feed your suppression store as soon as they arrive.`,
	relatedTerms: [
		{
			slug: "unsubscribe",
			title: "Unsubscribe",
		},
		{
			slug: "hard-bounce",
			title: "Hard Bounce",
		},
		{
			slug: "feedback-loop",
			title: "Feedback Loop",
		},
	],
	relatedFeatureHref: "/docs",
};
