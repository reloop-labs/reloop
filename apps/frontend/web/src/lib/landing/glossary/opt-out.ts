import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "opt-out",
	title: "Opt-out",
	description: "A user's request to stop receiving email from a sender.",
	keywords: ["opt-out email", "unsubscribe"],
	body: "Every marketing email must include a working unsubscribe link. Reloop handles list-unsubscribe headers and suppression automatically.",
	relatedTerms: [
		{
			slug: "unsubscribe",
			title: "Unsubscribe",
		},
	],
};
