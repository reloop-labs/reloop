import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "list-hygiene",
	title: "List Hygiene",
	description:
		"Ongoing cleanup of addresses that bounce, complain, never engage, or never consented.",
	keywords: ["list hygiene","email list cleaning","dead addresses"],
	body: `List hygiene is the unglamorous work that protects reputation: remove hard bounces, honor unsubscribes and complaints, prune chronic non-engagers, and stop mailing role accounts that never wanted bulk mail.

It is not a one-time “validation API” pass. Lists decay. People change jobs. Domains expire. A clean list last year is dirty now if you never send and never prune.

Build hygiene into every import and every campaign post-mortem. Reloop analytics and events give you the raw signals; your product logic decides when someone leaves the active audience.`,
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
