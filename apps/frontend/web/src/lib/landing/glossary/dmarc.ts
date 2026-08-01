import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "dmarc",
	title: "DMARC",
	description:
		"Domain-based Message Authentication, Reporting, and Conformance. Policy plus reports on SPF and DKIM results.",
	keywords: ["DMARC","DMARC policy","DMARC report"],
	body: `DMARC sits on top of SPF and DKIM. You publish a DNS TXT record that says what receivers should do when mail claiming your domain fails authentication: do nothing special (none), quarantine, or reject. It also asks for aggregate and optional forensic reports so you can see who sends as you.

Alignment matters. SPF or DKIM must pass and align with the From domain under DMARC's rules. A signature for a parent brand domain may not protect a marketing subdomain you actually send from, depending on configuration.

Most teams start with p=none and reporting, fix legitimate sources, then move to quarantine or reject. Jumping straight to reject without inventorying senders breaks real mail streams (CRMs, support tools, billing systems).

Reloop's auth tooling helps you verify records as you tighten policy.`,
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
			slug: "bimi",
			title: "BIMI",
		},
	],
	relatedFeatureHref: "/tools/auth-checker",
};
