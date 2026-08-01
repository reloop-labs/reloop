import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "starttls",
	title: "STARTTLS",
	description:
		"A way to upgrade an SMTP connection from plain text to TLS encryption.",
	keywords: ["STARTTLS","SMTP TLS","opportunistic TLS email"],
	body: `STARTTLS is a command in SMTP that upgrades the connection to TLS after the initial handshake. Opportunistic TLS means the parties encrypt when both support it, but may fall back if negotiation fails (unless configured to require TLS).

Encrypted hops protect mail in transit between servers that support it. They do not encrypt the message at rest in every mailbox, and intermediate hops vary. Still, requiring TLS to your ESP's submission endpoint is baseline hygiene for app credentials and message content on that leg.

Reloop's SMTP endpoints expect modern TLS clients for authenticated submission.`,
	relatedTerms: [
		{
			slug: "smtp",
			title: "SMTP",
		},
		{
			slug: "mta",
			title: "MTA",
		},
		{
			slug: "authentication",
			title: "Authentication",
		},
	],
	relatedFeatureHref: "/features/smtp",
};
