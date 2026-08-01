import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "domain-reputation",
	title: "Domain Reputation",
	description:
		"How mailbox providers rate your sending domain based on past behavior.",
	keywords: ["domain reputation email","sender domain score"],
	body: `Domain reputation is the trust score attached to the domain in your From address (and related authenticated domains). Providers build it from complaints, bounces, engagement, spam trap hits, and authentication history. It is not always a public number you can look up; you infer it from placement and postmaster tools.

A new domain starts with little history. Sudden volume looks suspicious. Steady, wanted mail helps. Parking a domain for years then blasting from it does not.

IP reputation and domain reputation interact. Moving to a new IP while keeping a trusted domain is different from moving both at once.

Use Google Postmaster Tools and similar dashboards when available. Reloop's deliverability features focus on the setup and signals you control day to day.`,
	relatedTerms: [
		{
			slug: "ip-reputation",
			title: "IP Reputation",
		},
		{
			slug: "reputation",
			title: "Reputation",
		},
		{
			slug: "deliverability",
			title: "Deliverability",
		},
	],
	relatedFeatureHref: "/features/deliverability",
};
