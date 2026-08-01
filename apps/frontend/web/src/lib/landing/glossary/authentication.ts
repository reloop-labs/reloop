import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "authentication",
	title: "Authentication",
	description:
		"Proving a message really came from the domain it claims, using SPF, DKIM, and DMARC.",
	keywords: ["email authentication","SPF DKIM DMARC","sender authentication"],
	body: `Email authentication is a set of DNS-based checks receiving servers run on inbound mail. The goal is simple: reduce spoofing so Gmail, Outlook, and other providers can trust (or reject) mail that pretends to be from your domain.

Three records do most of the work. SPF lists which servers may send for the domain. DKIM signs the message so headers and body can be verified. DMARC ties those results to a policy you publish (monitor, quarantine, or reject).

Without authentication, major mailbox providers treat your mail as higher risk. With it, you still need clean lists and solid reputation, but you clear a basic trust bar.

Reloop walks you through domain verification and generates the records you need. The auth checker tool can validate setup after DNS propagates.`,
	relatedTerms: [
		{
			slug: "spf",
			title: "SPF",
		},
		{
			slug: "dkim",
			title: "DKIM",
		},
		{
			slug: "dmarc",
			title: "DMARC",
		},
	],
	relatedFeatureHref: "/tools/auth-checker",
};
