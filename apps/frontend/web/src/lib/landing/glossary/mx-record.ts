import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "mx-record",
	title: "MX Record",
	description:
		"A DNS record that names the servers allowed to receive mail for a domain.",
	keywords: ["MX record","mail exchanger","MX DNS"],
	body: `MX (mail exchanger) records list hostnames that accept inbound mail for a domain, each with a priority number. Lower numbers are tried first. Senders look up MX records when delivering to you@yourdomain.com.

If MX points at the wrong place, you miss mail or black-hole it. If you use Google Workspace or Microsoft 365, their docs spell out the exact MX values. For custom inbound processing, MX points at your parser or gateway.

Outbound sending does not require you to receive mail on the same domain, but bounces and replies need a coherent setup. Many teams send from a subdomain with its own auth while corporate MX stays on the root domain.`,
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
