import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "throttling",
	title: "Throttling",
	description:
		"Deliberately slowing send rates to match provider limits or warming plans.",
	keywords: ["email throttling","send throttling","traffic shaping email"],
	body: `Throttling is intentional rate control: messages per minute, concurrent connections, or per-domain limits. Receivers throttle senders who connect too aggressively. You also throttle yourself during IP warming or when an ISP asks for slower delivery.

Good MTAs and ESPs implement per-domain concurrency caps because Gmail and Outlook want different patterns than a small corporate server.

If mail queues grow while deferrals mention rate or policy, reduce concurrency before you assume content is the problem.`,
	relatedTerms: [
		{
			slug: "rate-limiting",
			title: "Rate Limiting",
		},
		{
			slug: "ip-warming",
			title: "IP Warming",
		},
		{
			slug: "mta",
			title: "MTA",
		},
	],
	relatedFeatureHref: "/features/smtp",
};
