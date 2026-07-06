import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "spf",
	title: "SPF",
	description:
		"Sender Policy Framework—DNS records listing authorized sending servers for a domain.",
	keywords: ["SPF", "SPF record", "what is SPF"],
	body: "SPF prevents spoofing by publishing which IPs and services can send for your domain. Reloop provides the exact TXT record to add when you verify a domain.",
	relatedTerms: [
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
