import type { BlogPostDefinition } from "../types";

export const post: BlogPostDefinition = {
	slug: "transactional-email-best-practices",
	title: "Transactional Email Best Practices",
	description:
		"Patterns for password resets, receipts, and notifications that arrive fast and stay out of spam.",
	keywords: ["transactional email best practices", "transactional email tips"],
	publishedAt: "2026-05-20",
	tag: "Guides",
	readTime: "7 min read",
	sections: [
		{
			heading: "Speed is the product",
			paragraphs: [
				"Users expect password resets in seconds. Send synchronously on the critical path or queue with immediate workers—never batch transactional mail.",
			],
		},
		{
			heading: "Separate sending domains",
			paragraphs: [
				"Use mail.yourdomain.com or notifications.yourdomain.com for transactional sends. Keep marketing on a different subdomain to isolate reputation.",
			],
		},
		{
			heading: "Plain text + HTML",
			paragraphs: [
				"Always include a text/plain part. Keep HTML simple—heavy marketing layouts hurt transactional deliverability.",
			],
		},
	],
};
