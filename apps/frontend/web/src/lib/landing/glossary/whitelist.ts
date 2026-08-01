import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "whitelist",
	title: "Allowlist",
	description:
		"A list of trusted senders, IPs, or domains that bypass some filters. Often still called a whitelist in older docs.",
	keywords: ["email allowlist","email whitelist","trusted sender list"],
	body: `An allowlist (historically “whitelist”) marks senders you trust so filters treat them more gently. Organizations maintain internal allowlists for partners. Some older deliverability advice talked about getting on ISP allowlists; that model is rarer than it once was.

Allowlisting is not a substitute for authentication and consent. It is a local policy tool. If you rely on a customer adding you to their gateway allowlist to get mail through, your broader reputation still needs work.

Prefer precise terms in new docs: allowlist and blocklist. Reloop's glossary keeps “Allowlist” as the title while recognizing the legacy name people search for.`,
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
