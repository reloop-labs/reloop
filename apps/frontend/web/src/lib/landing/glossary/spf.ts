import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "spf",
	title: "SPF",
	description:
		"A DNS record that lists which hosts are allowed to send mail for your domain.",
	keywords: ["SPF", "SPF record", "TXT SPF"],
	body: `SPF (Sender Policy Framework) is a DNS TXT record on your domain that lists authorized sending IPs and includes (other domains' policies). Receivers check the connecting IP against that list for the envelope sender domain.

Common failures: too many DNS lookups (SPF has a 10-lookup limit), missing a vendor after you add a new CRM, or publishing multiple SPF TXT records (invalid). Flatten carefully; naive flattening breaks when vendors change IPs.

SPF alone does not protect the visible From header. That is why DMARC exists. Reloop gives you the SPF record to add during domain verification and tools to check it afterward.`,
	relatedTerms: [
		{
			slug: "dkim",
			title: "DKIM",
		},
		{
			slug: "dmarc",
			title: "DMARC",
		},
		{
			slug: "envelope",
			title: "Envelope",
		},
	],
	relatedFeatureHref: "/tools/auth-checker",
};
