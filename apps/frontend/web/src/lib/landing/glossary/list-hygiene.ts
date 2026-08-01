import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "list-hygiene",
	title: "List Hygiene",
	description:
		"Keeping your mailing list clean: remove bad, inactive, and unwanted addresses.",
	keywords: ["list hygiene", "email list cleaning", "dead addresses"],
	body: `List hygiene is the ongoing work of removing hard bounces, unsubscribes, complainers, role accounts you should not mail, and long-inactive addresses. Dirty lists raise bounces and complaints and drag reputation down.

Hygiene is not a one-time import cleanup. People change jobs, abandon inboxes, and forget they signed up. Re-permission campaigns and sunset policies keep the active list honest.

Validate at capture, suppress on hard bounce and complaint, and segment by engagement. Reloop validation and analytics support that loop.`,
	relatedTerms: [
		{
			slug: "hard-bounce",
			title: "Hard Bounce",
		},
		{
			slug: "suppression-list",
			title: "Suppression List",
		},
		{
			slug: "engagement",
			title: "Engagement",
		},
	],
	relatedFeatureHref: "/features/email-validation",
};
