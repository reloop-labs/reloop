import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "whitelist",
	title: "Allowlist",
	description:
		"A list of trusted senders, IPs, or domains that bypass some filters (also called an allowlist).",
	keywords: ["email allowlist","email whitelist","trusted sender list"],
	body: `An allowlist (historically “whitelist”) marks senders you trust so filters treat them more gently. Organizations keep internal allowlists for partners. Older deliverability advice talked about getting on ISP allowlists; that model is rarer than it once was.

Allowlisting is not a substitute for authentication and consent. It is a local policy tool. If you need a customer to add you to their gateway allowlist just to get mail through, your broader reputation still needs work.

Prefer precise terms in new docs: allowlist and blocklist. Reloop's glossary uses “Allowlist” as the title while still recognizing the legacy name people search for.`,
	relatedTerms: [
		{
			slug: "blocklist",
			title: "Blocklist",
		},
		{
			slug: "authentication",
			title: "Authentication",
		},
		{
			slug: "deliverability",
			title: "Deliverability",
		},
	],
	relatedFeatureHref: "/features/deliverability",
};
