import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "dkim",
	title: "DKIM",
	description:
		"DomainKeys Identified Mail—cryptographic signatures that verify email authenticity.",
	keywords: ["DKIM", "DKIM setup", "what is DKIM"],
	body: "DKIM adds a digital signature to each message header. Receiving servers verify the signature against your public DNS record. Reloop generates DKIM keys automatically when you verify a domain.",
	relatedTerms: [
		{
			slug: "spf",
			title: "SPF",
		},
		{
			slug: "dmarc",
			title: "DMARC",
		},
	],
	relatedFeatureHref: "/tools/auth-checker",
};
