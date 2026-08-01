import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "transactional-email",
	title: "Transactional Email",
	description:
		"Messages triggered by a user action or account event: receipts, resets, invites, alerts.",
	keywords: ["transactional email","triggered email","product email"],
	body: `Transactional email is mail your product sends because something happened: signup, password reset, invoice, shipping notice, security alert. The user expects it. Marketing newsletters are a different stream with different consent rules.

These messages should be fast, reliable, and boring in the best way. Delay on a password reset is a support ticket. Design plain-text fallbacks and avoid heavy campaign layouts that look promotional.

Reloop focuses on developer-friendly transactional delivery (API and SMTP) with the same codebase available for self-hosting.`,
	relatedTerms: [
		{
			slug: "marketing-email",
			title: "Marketing Email",
		},
		{
			slug: "smtp",
			title: "SMTP",
		},
		{
			slug: "api",
			title: "API",
		},
	],
	relatedFeatureHref: "/features/transaction-emails",
};
