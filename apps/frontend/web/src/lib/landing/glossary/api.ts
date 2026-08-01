import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "api",
	title: "API",
	description:
		"Application Programming Interface. How your app talks to an email service over HTTP.",
	keywords: ["email API","transactional email API","REST email API"],
	body: `An API is a contract: your code sends structured requests, the service returns structured responses. For email, that usually means HTTP endpoints to send messages, manage contacts, inspect delivery events, and configure domains.

Most email APIs accept JSON, return message IDs, and publish webhooks when something happens after the send (delivered, bounced, opened). SDKs wrap those HTTP calls so you write less boilerplate in your language of choice.

Reloop exposes a REST API for transactional sends, campaigns, and related resources. You can also use SMTP if your stack already speaks that protocol.`,
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
