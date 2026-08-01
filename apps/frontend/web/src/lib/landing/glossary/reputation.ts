import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "reputation",
	title: "Reputation",
	description:
		"The overall trust mailbox providers assign to your IPs, domains, and sending patterns.",
	keywords: ["sender reputation","email reputation","sender score"],
	body: `Reputation is the composite judgment receivers form about you. It draws on complaints, bounces, spam traps, authentication, volume stability, and whether people read or delete your mail. There is no single global score, though third-party tools try to estimate pieces of it.

Think of reputation as earned slowly and lost quickly. A bad campaign or dirty import can undo months of careful sending.

Protect it with consent, hygiene, authentication, and steady volume. Reloop's product focus is giving you the auth, validation, and analytics levers that feed reputation day to day.`,
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
