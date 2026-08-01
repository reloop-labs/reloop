import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "mta",
	title: "MTA",
	description:
		"Software that routes and delivers email between servers using SMTP.",
	keywords: ["MTA","mail transfer agent","mail server"],
	body: `An MTA (Mail Transfer Agent) is the server software that accepts, queues, and forwards mail. Examples include Postfix, Exim, and the delivery fleets inside ESPs. Your app rarely talks to the recipient's MTA directly; it talks to an ESP or your own relay, which then hops toward the destination MX.

MTAs enforce rate limits, retries, TLS, and bounce generation. Tuning concurrency and queues is how operators keep delivery smooth under load.

When you use Reloop, you are relying on MTA behavior behind the API or SMTP submission layer without running Postfix yourself unless you self-host the full stack.`,
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
