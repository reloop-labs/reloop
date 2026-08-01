import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "content-filtering",
	title: "Content Filtering",
	description:
		"Scanning the text, HTML, and attachments of a message for spam, phishing, or policy risk.",
	keywords: ["spam filter","content filter","email content scanning"],
	body: `Content filters score what is inside the message: words, links, HTML structure, attachments, and sometimes image-to-text. They sit next to authentication and reputation. A clean domain can still land in spam if the body looks like a phishing kit.

Common triggers include deceptive URLs, mismatched brand claims, sketchy attachments, and bulk patterns that match known campaigns. Filters change often, so static “words to avoid” lists go stale. Real issues are intent, trust, and consistency with past mail.

Write like a human sending something useful. Use domains you control, avoid URL shorteners that hide destinations, and keep templates consistent with your product.

Reloop's spam testing helps catch obvious content problems before a full send.`,
	relatedTerms: [
		{
			slug: "deliverability",
			title: "Deliverability",
		},
		{
			slug: "spam-trap",
			title: "Spam Trap",
		},
		{
			slug: "mime",
			title: "MIME",
		},
	],
	relatedFeatureHref: "/features/deliverability",
};
