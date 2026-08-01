import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "soft-bounce",
	title: "Soft Bounce",
	description:
		"A temporary delivery failure that may succeed on retry.",
	keywords: ["soft bounce","temporary bounce","4xx bounce"],
	body: `A soft bounce is a temporary problem: mailbox full, greylisting, rate limiting, or a transient outage. The correct response is retry with backoff, not immediate suppression.

If the same address soft-bounces for days, escalate policy: pause, investigate, or treat as undeliverable. Endless retries against a full mailbox help no one.

Your ESP should distinguish soft from hard when providers give enough signal. Reloop exposes bounce types in events so automation can choose retry vs suppress.`,
	relatedTerms: [
		{
			slug: "hard-bounce",
			title: "Hard Bounce",
		},
		{
			slug: "bounce",
			title: "Bounce",
		},
		{
			slug: "greylisting",
			title: "Greylisting",
		},
	],
	relatedFeatureHref: "/features/email-analytics",
};
