import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "dns",
	title: "DNS",
	description:
		"The lookup system that maps domain names to mail servers, keys, and policies.",
	keywords: ["DNS email","DNS records email","mail DNS"],
	body: `DNS is how the internet finds services by name. Email leans on it hard: MX records point to inbound servers, SPF and DMARC live in TXT records, DKIM public keys are TXT records under selectors, and BIMI uses its own records.

Propagation delay is normal. You change a record, wait for TTLs to expire at resolvers, then re-test. What you see with dig can differ from what Gmail's resolvers see for a while.

If authentication “doesn't work,” check the exact hostname and record type first. A correct value on the wrong name is still wrong.`,
	relatedTerms: [
		{
			slug: "mx-record",
			title: "MX Record",
		},
		{
			slug: "spf",
			title: "SPF",
		},
		{
			slug: "dkim",
			title: "DKIM",
		},
	],
	relatedFeatureHref: "/tools/auth-checker",
};
