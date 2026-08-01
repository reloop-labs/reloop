import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "inbound-email",
	title: "Inbound Email",
	description:
		"Mail your system receives and processes, not only the mail you send out.",
	keywords: ["inbound email","incoming email parsing","reply handling"],
	body: `Inbound email is everything that hits your domain's MX path: support replies, plus-addressed tickets, bounce messages, and user-generated mail your product parses. Outbound ESPs sometimes offer inbound routing or parsing webhooks so apps can treat email as an API input.

Use cases include helpdesks, bounce processing, and “email a document to your account” features. You will deal with spam, spoofing, and MIME edge cases. Authentication results on inbound mail help you decide what to trust.

Reloop's broader platform direction includes product email workflows; check product docs for inbound capabilities as you build.`,
	relatedTerms: [
		{
			slug: "mx-record",
			title: "MX Record",
		},
		{
			slug: "mime",
			title: "MIME",
		},
		{
			slug: "webhook",
			title: "Webhook",
		},
	],
	relatedFeatureHref: "/docs",
};
