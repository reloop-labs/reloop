import type { BlogPostDefinition } from "../types";

export const post: BlogPostDefinition = {
	slug: "migrating-from-sendgrid",
	title: "Migrating from SendGrid to Reloop",
	description: "Step-by-step migration: map APIs, switch SMTP, update webhooks, and validate deliverability during the cutover.",
	keywords: [
		"migrate from SendGrid",
		"SendGrid migration",
		"SendGrid to Reloop",
	],
	publishedAt: "2026-06-01",
	tag: "Migration",
	readTime: "10 min read",
	sections: [
		{
			heading: "Plan the cutover",
			paragraphs: [
				"Run Reloop in parallel before switching DNS or API keys. Send test traffic to seed inboxes and compare delivery rates.",
				"Map SendGrid endpoints to Reloop's REST API or use SMTP relay for drop-in compatibility with existing code.",
			],
		},
		{
			heading: "Update DNS",
			paragraphs: [
				"Replace SendGrid SPF includes with Reloop's. Add new DKIM selectors before removing old ones to avoid a gap in signing.",
			],
		},
		{
			heading: "Rewire webhooks",
			paragraphs: [
				"Reloop webhook payloads differ from SendGrid's. Update your handlers for delivered, bounce, and spam complaint events.",
			],
		},
	],
};
