import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "rate-limiting",
	title: "Rate Limiting",
	description:
		"Caps on how fast you may send or call APIs, set by providers or your own infrastructure.",
	keywords: ["email rate limit","SMTP rate limit","send throttling"],
	body: `Rate limits protect receivers and shared infrastructure from floods. Your ESP may limit messages per second per account. Remote MTAs may defer you if you open too many connections. APIs return 429 when you exceed quotas.

Design clients with backoff and queues. Bursting an entire day's marketing send in one minute looks abusive even when the content is fine.

Reloop plans include monthly email quotas and fair-use patterns; self-hosted setups need their own outbound rate policy toward remote servers.`,
	relatedTerms: [
		{
			slug: "throttling",
			title: "Throttling",
		},
		{
			slug: "smtp",
			title: "SMTP",
		},
		{
			slug: "ip-warming",
			title: "IP Warming",
		},
	],
	relatedFeatureHref: "/pricing",
};
