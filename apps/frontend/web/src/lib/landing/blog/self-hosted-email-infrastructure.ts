import type { BlogPostDefinition } from "../types";

export const post: BlogPostDefinition = {
	slug: "self-hosted-email-infrastructure",
	title: "Self-Hosted Email Infrastructure: When and How",
	description: "Why teams self-host email, what Reloop gives you out of the box, and how to deploy with Docker Compose.",
	keywords: [
		"self-hosted email",
		"self-host email server",
		"open source email infrastructure",
	],
	publishedAt: "2026-04-28",
	tag: "Self-hosting",
	readTime: "9 min read",
	sections: [
		{
			heading: "When self-hosting makes sense",
			paragraphs: [
				"Data residency requirements, cost at scale, security review of source code, or simply not wanting vendor lock-in—these are the common drivers.",
			],
		},
		{
			heading: "What you get with Reloop",
			paragraphs: [
				"Reloop is Apache 2.0: transactional API, campaigns, SMTP, webhooks, templates, and analytics—same product hosted or self-deployed.",
			],
		},
		{
			heading: "Docker Compose quickstart",
			paragraphs: [
				"Clone the repo, configure environment variables, and docker compose up. See our self-hosting guide for production hardening.",
			],
		},
	],
};
