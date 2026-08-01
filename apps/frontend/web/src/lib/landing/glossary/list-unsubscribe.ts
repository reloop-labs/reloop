import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "list-unsubscribe",
	title: "List-Unsubscribe",
	description:
		"A header (and sometimes a one-click path) that lets clients offer a built-in unsubscribe action.",
	keywords: ["List-Unsubscribe", "one-click unsubscribe", "RFC 8058"],
	body: `List-Unsubscribe is an email header that points to an unsubscribe URL or mailto. Many clients show a native “Unsubscribe” control when the header is present. One-click List-Unsubscribe (RFC 8058) lets the client post a simple request without opening a browser form.

Use it on marketing and bulk mail. Make the endpoint fast, idempotent, and wired to your real suppression store. A header that 404s is worse than no header.

Transactional mail often omits marketing unsubscribe controls, but product preferences still matter. Reloop supports standard headers when you send bulk or marketing streams.`,
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
