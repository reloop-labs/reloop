import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "reputation",
	title: "Reputation",
	description:
		"Overall trust mailbox providers assign to your sending identity (IPs, domains, and patterns).",
	keywords: ["sender reputation","email reputation","sender score"],
	body: `Reputation is the composite judgment receivers form about you. It draws on complaints, bounces, spam traps, authentication, volume stability, and whether people read or delete your mail. There is no single global score, though third-party tools try to estimate pieces of it.

Think long-term. One clean campaign does not erase months of junk. One incident can dent a young domain quickly.

Operational habits matter more than copy tricks: consent, hygiene, authentication, predictable volume. Reloop's product surface area (auth, analytics, validation) exists to support those habits.`,
	relatedTerms: [
		{
			slug: "domain-reputation",
			title: "Domain Reputation",
		},
		{
			slug: "ip-reputation",
			title: "IP Reputation",
		},
		{
			slug: "complaint-rate",
			title: "Complaint Rate",
		},
	],
	relatedFeatureHref: "/features/deliverability",
};
