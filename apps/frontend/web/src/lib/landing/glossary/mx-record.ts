import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "mx-record",
	title: "MX Record",
	description:
		"A DNS record that names which servers receive mail for a domain.",
	keywords: ["MX record", "mail exchanger", "MX DNS"],
	body: `MX (mail exchanger) records list hostnames that accept inbound mail for a domain, each with a priority number. Lower numbers are tried first. Senders look up MX records when delivering to you@yourdomain.com.

If MX points at the wrong place, you miss mail or black-hole it. If you only send mail and never receive, you still need sensible MX or explicit handling so bounces and replies have a home.

Change MX carefully and watch TTL. Reloop inbound features document the records you need when you receive through the platform.`,
	relatedTerms: [
		{
			slug: "dns",
			title: "DNS",
		},
		{
			slug: "inbound-email",
			title: "Inbound Email",
		},
		{
			slug: "smtp",
			title: "SMTP",
		},
	],
	relatedFeatureHref: "/docs",
};
