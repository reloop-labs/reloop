import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "mime",
	title: "MIME",
	description:
		"The format that lets email carry HTML, plain text, images, and attachments in one message.",
	keywords: ["MIME email", "multipart MIME", "email attachments"],
	body: `MIME is how email carries more than plain ASCII: HTML parts, alternative plain text, inline images, and attachments. A multipart/alternative message often includes text/plain and text/html so clients can choose. multipart/mixed adds attachments.

Boundaries, content-transfer encoding, and Content-Type headers are easy to get wrong by hand. Use a library or ESP template system instead of concatenating strings.

Reloop's template tools produce well-formed MIME so clients render the HTML (or fall back to text) predictably.`,
	relatedTerms: [
		{
			slug: "email-client",
			title: "Email Client",
		},
		{
			slug: "smtp",
			title: "SMTP",
		},
		{
			slug: "transactional-email",
			title: "Transactional Email",
		},
	],
	relatedFeatureHref: "/features/email-templates",
};
