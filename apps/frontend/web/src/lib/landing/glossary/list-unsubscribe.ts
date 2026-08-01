import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "list-unsubscribe",
	title: "List-Unsubscribe",
	description:
		"Headers (and related mechanisms) that let clients offer a one-click unsubscribe.",
	keywords: ["List-Unsubscribe","one-click unsubscribe","RFC 8058"],
	body: `List-Unsubscribe headers tell supporting clients how a recipient can opt out without digging through footer HTML. Modern one-click unsubscribe (often paired with List-Unsubscribe-Post) lets the client send a POST that your system must honor quickly.

Mailbox providers increasingly expect working one-click unsubscribe on bulk mail. Broken or slow handlers create spam complaints instead.

Footer links remain useful as a fallback. The header path should hit the same suppression logic. Reloop and standards-compliant ESP stacks support these headers on campaign traffic.`,
	relatedTerms: [
		{
			slug: "unsubscribe",
			title: "Unsubscribe",
		},
		{
			slug: "opt-out",
			title: "Opt-out",
		},
		{
			slug: "marketing-email",
			title: "Marketing Email",
		},
	],
	relatedFeatureHref: "/docs",
};
