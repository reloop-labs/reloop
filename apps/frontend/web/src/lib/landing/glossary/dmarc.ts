import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "dmarc",
	title: "DMARC",
	description:
		"A domain policy (plus reports) that tells receivers what to do when SPF or DKIM fail.",
	keywords: ["DMARC", "DMARC policy", "DMARC report"],
	body: `DMARC sits on top of SPF and DKIM. You publish a DNS TXT record that says what receivers should do when mail claiming your domain fails authentication: do nothing special (none), quarantine, or reject. It also asks for aggregate and optional forensic reports so you can see who sends as you.

Alignment matters. SPF or DKIM must pass and align with the From domain under DMARC's rules. A signature for a parent brand domain may not protect a marketing subdomain you actually send from, depending on setup.

Most teams start with p=none and reporting, fix legitimate sources, then move to quarantine or reject. Jumping straight to reject without inventorying senders breaks real streams (CRMs, support tools, billing systems).

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
