import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "api",
	title: "API",
	description:
		"How your app talks to an email service over HTTP: send mail, check status, manage settings.",
	keywords: ["email API","transactional email API","REST email API"],
	body: `An email API is a set of HTTP endpoints your code calls instead of speaking SMTP by hand. You send a structured request (usually JSON), get a message ID back, and later hear about delivery through webhooks.

Typical calls cover sending, contacts, domains, and delivery events. SDKs wrap the HTTP so you write less boilerplate in your language of choice.

Reloop has a REST API for transactional sends, campaigns, and related resources. If your stack already uses SMTP, that still works too.`,
	relatedTerms: [
		{
			slug: "webhook",
			title: "Webhook",
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
	relatedFeatureHref: "/docs/api",
};
