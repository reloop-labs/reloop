import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "email-client",
	title: "Email Client",
	description:
		"The app or site people use to read mail, such as Gmail, Outlook, or Apple Mail.",
	keywords: ["email client","MUA","mail user agent"],
	body: `An email client (mail user agent) is where humans read and send messages. Desktop apps, mobile apps, and webmail all count. Each renders HTML differently. What looks perfect in one client breaks in another.

Clients also enforce privacy rules: image blocking, link protection, and open-tracking limits. Design with progressive enhancement: a solid plain-text part, simple HTML, inline CSS patterns known to work, and real testing on major clients.

Reloop's template tools help you build messages that hold up across common clients; still send yourself a preview before a large campaign.`,
	relatedTerms: [
		{
			slug: "mime",
			title: "MIME",
		},
		{
			slug: "open-rate",
			title: "Open Rate",
		},
		{
			slug: "tracking-pixel",
			title: "Tracking Pixel",
		},
	],
	relatedFeatureHref: "/features/email-templates",
};
