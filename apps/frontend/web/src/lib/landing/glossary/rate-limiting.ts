import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "rate-limiting",
	title: "Rate Limiting",
	description:
		"Caps on how fast you may send mail or call APIs, set by providers or your own stack.",
	keywords: ["email rate limit", "SMTP rate limit", "send throttling"],
	body: `Rate limits protect receivers and shared infrastructure from floods. Your ESP may limit messages per second per account. Remote MTAs may defer you if you open too many connections. APIs return 429 when you exceed quotas.

Design clients with backoff and queues. Bursting an entire campaign in one second is a good way to earn deferrals.

Reloop enforces account and plan limits so shared infrastructure stays healthy; your app should handle 429s and deferred SMTP responses gracefully.`,
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
