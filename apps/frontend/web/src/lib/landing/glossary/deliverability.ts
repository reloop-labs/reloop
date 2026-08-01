import type { GlossaryTermDefinition } from "../types";

export const term: GlossaryTermDefinition = {
	slug: "deliverability",
	title: "Deliverability",
	description:
		"Whether mail reaches the inbox (or at least the mailbox) instead of spam, quarantine, or rejection.",
	keywords: ["email deliverability", "inbox placement", "delivery rate"],
	body: `Deliverability answers a practical question: did the message get where a human will see it? Acceptance by the receiving server is not enough. Spam folders and silent filtering still count as failure for product and marketing goals.

It depends on authentication, IP and domain reputation, list quality, engagement, content, and sending patterns. Fixing only one piece rarely works. A perfect DKIM signature will not save a purchased list.

Measure more than “sent successfully.” Watch bounces, complaints, unsubscribes, and seed tests across major providers. Inbox placement tests are imperfect but useful for spotting regressions.

Reloop combines auth setup, spam testing, and analytics so you can see problems before a big campaign goes out.`,
	relatedTerms: [
		{
			slug: "inbox-placement",
			title: "Inbox Placement",
		},
		{
			slug: "reputation",
			title: "Reputation",
		},
		{
			slug: "authentication",
			title: "Authentication",
		},
	],
	relatedFeatureHref: "/features/deliverability",
};
