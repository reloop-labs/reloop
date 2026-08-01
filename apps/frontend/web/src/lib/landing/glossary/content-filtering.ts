import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "content-filtering",
	title: "Content Filtering",
	description:
		"Scanning message text, HTML, and attachments to decide spam, phishing, or policy risk.",
	keywords: ["spam filter","content filter","email content scanning"],
	body: `Content filters score what is inside the message: words, links, HTML structure, attachments, and sometimes image-to-text. They sit alongside authentication and reputation. A clean domain can still land in spam if the body looks like a phishing kit.

Common triggers include deceptive URLs, mismatched brand claims, malware-like attachments, and bulk patterns that match known campaigns. Filters evolve constantly, so “magic words to avoid” lists go stale. Real issues are intent, trust, and consistency with past mail.

Write like a human sending a useful message. Use real domains you control, avoid URL shorteners that hide destinations, and keep templates consistent with your product brand.

Reloop's spam testing helps you catch obvious content problems before a full send.`,
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
