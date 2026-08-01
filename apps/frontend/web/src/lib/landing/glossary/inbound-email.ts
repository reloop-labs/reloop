import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "inbound-email",
	title: "Inbound Email",
	description:
		"Mail your system receives and processes, not only the mail you send out.",
	keywords: ["inbound email", "incoming email parsing", "reply handling"],
	body: `Inbound email is traffic coming into your domain or app: support@, replies, webhooks from partners, or parse-to-API pipelines. Outbound is what you send. Many products need both.

Inbound setup means MX records (or a provider that receives for you), routing rules, and often parsing (attachments, headers, thread IDs). Security matters: spoofed mail, spam, and large attachments.

Reloop includes inbound capabilities so you can receive and process mail in the same platform you use for sending.`,
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
