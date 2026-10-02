import type { AlternativeDefinition } from "../types";

export const config: AlternativeDefinition = {
	slug: "mailgun",
	path: "/alternatives/mailgun",
	competitorName: "Mailgun",
	compareHref: "/compare/mailgun",
	titleLines: ["Best Mailgun Alternative", "in 2026: Reloop"],
	description:
		"Reloop is the open-source Mailgun alternative for 2026: same REST + SMTP surface with self-hosting, $10/50k send-based pricing, and an agent inbox.",
	keywords: [
		"Mailgun alternative",
		"best Mailgun alternative",
		"Mailgun alternatives 2026",
		"Mailgun competitor",
		"open source Mailgun alternative",
		"self-hosted Mailgun alternative",
		"Reloop vs Mailgun",
	],
	updatedAt: "September 17, 2026",
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Full comparison",
		href: "/compare/mailgun",
	},
	highlights: [
		"$10/mo for 50,000 emails vs $35 Foundation — $0.50 vs $1.30+ per 1k overage",
		"REST API + SMTP relay with event webhooks and validation",
		"Agent inbox with spam scoring and threading beyond inbound routes",
		"Self-hostable Apache 2.0 core for data residency and cost control",
		"Campaign builder beyond pure transactional sends",
		"Hosted by Reloop Labs or deploy on your own infrastructure",
	],
	sections: [
		{
			title: "Reloop vs Mailgun",
			items: [
				{
					title: "Full stack",
					description:
						"Transactional, campaigns, templates, and contacts in one product.",
				},
				{
					title: "Self-hosting",
					description:
						"Mailgun is hosted-only; Reloop runs on your infrastructure.",
				},
				{
					title: "Agent-ready",
					description:
						"Native inbox APIs for AI workflows Mailgun doesn't offer.",
				},
			],
		},
	],
	cta: {
		title: "Replace Mailgun",
		titleMuted: "Start free today.",
		description: "Drop-in SMTP and REST API migration paths.",
		primary: {
			label: "Get started free",
			href: "/dashboard/signup",
		},
		secondary: {
			label: "Read documentation",
			href: "/docs",
		},
	},
	faqs: [
		{
			question: "What is the best Mailgun alternative in 2026?",
			answer:
				"Reloop is the best open-source Mailgun alternative for teams that want the same REST + SMTP surface with self-hosting, $10/month for 50,000 emails vs $35 Foundation, and an agent inbox — hosted or self-hosted from one Apache 2.0 codebase.",
		},
		{
			question: "Can Reloop replace Mailgun inbound routes?",
			answer:
				"Yes. Map inbound route URLs to Reloop handlers; the agent inbox adds spam scoring, threading, and triage before webhooks fire — covering reply handling and support-inbox automation.",
		},
		{
			question: "How much can we save switching from Mailgun?",
			answer:
				"At 50,000 emails/month: $10 on Reloop Pro vs $35 on Mailgun Foundation. Overage is $0.50 vs from $1.30 per 1,000. Validation and dedicated IPs are add-ons above Mailgun tiers; compare the all-in bill. Prices are public list prices as of September 17, 2026.",
		},
		{
			question: "Do SMTP senders need code changes?",
			answer:
				"No — change host, port, and credentials only. API senders need a small client adapter since Reloop is not a drop-in Mailgun proxy.",
		},
		{
			question: "When should we stay on Mailgun?",
			answer:
				"Stay if inbound routes, validation add-ons, and current tier pricing already fit your volume with no need for source access or self-hosting.",
		},
	],
};
