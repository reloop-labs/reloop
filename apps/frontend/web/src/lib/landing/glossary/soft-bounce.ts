import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "soft-bounce",
	title: "Soft Bounce",
	description: "A temporary delivery failure—full mailbox, server timeout, etc.",
	keywords: [
		"soft bounce",
		"temporary bounce",
	],
	body: "Soft bounces may succeed on retry. Reloop retries transient failures automatically before marking a permanent failure.",
	relatedTerms: [
		{
			slug: "hard-bounce",
			title: "Hard Bounce",
		},
	],
};
