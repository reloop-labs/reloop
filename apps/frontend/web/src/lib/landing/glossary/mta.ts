import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "mta",
	title: "MTA",
	description:
		"Mail Transfer Agent. Software that routes and delivers email between servers using SMTP.",
	keywords: ["MTA","mail transfer agent","mail server"],
	body: `An MTA is the server software that accepts, queues, and forwards mail. Examples include Postfix, Exim, and the delivery fleets inside ESPs. Your app rarely speaks to the recipient's MTA directly; it talks to an ESP or your own relay, which then hops toward the destination MX.

MTAs handle retries, deferrals, connection limits, and TLS. Tuning them is a discipline of its own. Most product teams buy or adopt a platform instead of running raw Postfix on day one.

Self-hosting Reloop means you still think about outbound delivery paths; hosted Reloop keeps that closer to a managed service.`,
	relatedTerms: [
		{
			slug: "smtp",
			title: "SMTP",
		},
		{
			slug: "mx-record",
			title: "MX Record",
		},
		{
			slug: "greylisting",
			title: "Greylisting",
		},
	],
	relatedFeatureHref: "/features/smtp",
};
