import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "mime",
	title: "MIME",
	description: "Multipurpose Internet Mail Extensions—a standard for HTML, text, and attachments in email.",
	keywords: [
		"MIME email",
		"multipart email",
	],
	body: "Most transactional emails use multipart/alternative with both HTML and plain-text parts for accessibility and deliverability.",
};
