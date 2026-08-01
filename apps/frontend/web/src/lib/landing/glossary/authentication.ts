import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "authentication",
	title: "Authentication",
	description:
		"Checks (SPF, DKIM, DMARC) that prove a message really came from the domain it claims.",
	keywords: ["email authentication","SPF DKIM DMARC","sender authentication"],
	body: `Email authentication is a set of DNS checks receiving servers run on inbound mail. The point is simple: make spoofing harder so Gmail, Outlook, and others can trust (or reject) mail that pretends to be from your domain.

Three records do most of the work. SPF lists which servers may send for the domain. DKIM signs the message so headers and body can be checked. DMARC says what to do when those checks fail (monitor, quarantine, or reject).

Without authentication, major providers treat your mail as higher risk. With it, you still need clean lists and decent reputation, but you clear a basic trust bar.

Reloop walks you through domain verification and generates the records you need. The auth checker tool can re-check setup after DNS propagates.`,
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
