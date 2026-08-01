import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "envelope",
	title: "Envelope",
	description:
		"The SMTP-level sender and recipient used to route mail, separate from the visible From header.",
	keywords: ["SMTP envelope","MAIL FROM","envelope sender"],
	body: `The envelope is what SMTP uses during the session: MAIL FROM (return path / envelope sender) and RCPT TO (recipients). The headers people see (From, To, Reply-To) can differ. That split is normal and sometimes required for bounce handling.

SPF checks the envelope sender domain against DNS. DMARC, by contrast, cares about alignment with the header From. Misunderstanding that split causes a lot of “SPF passed but DMARC failed” confusion.

Bounce processing depends on a working envelope sender. If MAIL FROM is forged or undeliverable, you lose bounce visibility.`,
	relatedTerms: [
		{
			slug: "return-path",
			title: "Return-Path",
		},
		{
			slug: "spf",
			title: "SPF",
		},
		{
			slug: "smtp",
			title: "SMTP",
		},
	],
	relatedFeatureHref: "/features/smtp",
};
