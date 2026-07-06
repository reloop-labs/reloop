import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "dmarc",
	title: "DMARC",
	description:
		"Domain-based Message Authentication, Reporting, and Conformance—a policy framework for email authentication.",
	keywords: ["DMARC", "DMARC policy", "what is DMARC"],
	body: "DMARC tells receivers what to do when SPF or DKIM fails and sends you aggregate reports. Start with p=none to monitor, then tighten to quarantine or reject.",
	relatedTerms: [
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
