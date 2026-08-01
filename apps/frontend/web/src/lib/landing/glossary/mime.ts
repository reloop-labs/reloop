import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "mime",
	title: "MIME",
	description:
		"Multipurpose Internet Mail Extensions. The format for multipart messages, HTML bodies, and attachments.",
	keywords: ["MIME email","multipart MIME","email attachments"],
	body: `MIME is how email carries more than plain ASCII: HTML parts, alternative plain text, inline images, and attachments. A multipart/alternative message often includes text/plain and text/html so clients can choose. multipart/mixed adds attachments.

Boundaries, content-transfer encodings (base64, quoted-printable), and Content-Type headers are easy to get wrong when you build raw messages by hand. Prefer a maintained MIME library or your ESP's template API.

Broken MIME leads to empty bodies, garbled attachments, or spam scores that assume you are hiding content. Reloop's sending APIs construct standards-compliant MIME for you when you send structured templates or HTML.`,
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
