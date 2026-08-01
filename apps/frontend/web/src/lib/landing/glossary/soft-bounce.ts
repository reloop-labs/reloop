import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "soft-bounce",
	title: "Soft Bounce",
	description:
		"A temporary delivery failure that may succeed if you try again later.",
	keywords: ["soft bounce","temporary bounce","4xx bounce"],
	body: `A soft bounce is a temporary problem: mailbox full, greylisting, rate limiting, or a short outage. The right response is retry with backoff, not immediate suppression.

If the same address soft-bounces for days, escalate: pause, investigate, or treat as undeliverable under your policy. Do not loop forever.

Reloop classifies soft vs hard bounces in events so your automation can retry smartly instead of guessing from SMTP text alone.`,
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
