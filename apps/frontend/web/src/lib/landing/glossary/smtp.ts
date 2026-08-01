import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "smtp",
	title: "SMTP",
	description:
		"The protocol servers use to move email across the internet (Simple Mail Transfer Protocol).",
	keywords: ["SMTP", "SMTP relay", "SMTP protocol"],
	body: `SMTP is the protocol for moving messages between MTAs. Your app might submit mail with SMTP (submission on port 587 with authentication) or with an HTTP API that turns into SMTP later. Between servers, MX hosts speak SMTP on port 25.

Commands like EHLO, MAIL FROM, RCPT TO, and DATA define the session. Responses use numeric codes: 2xx success, 4xx try again, 5xx permanent failure. TLS via STARTTLS encrypts the hop when both sides support it.

Reloop offers SMTP relay next to HTTP APIs so legacy apps can keep their existing mail libraries.`,
	relatedTerms: [
		{
			slug: "mta",
			title: "MTA",
		},
		{
			slug: "starttls",
			title: "STARTTLS",
		},
		{
			slug: "envelope",
			title: "Envelope",
		},
	],
	relatedFeatureHref: "/features/smtp",
};
