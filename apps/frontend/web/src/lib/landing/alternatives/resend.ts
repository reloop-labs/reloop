import type { AlternativeDefinition } from "../types";

export const config: AlternativeDefinition = {
	slug: "resend",
	path: "/alternatives/resend",
	competitorName: "Resend",
	compareHref: "/compare/resend",
	titleLines: ["Best Resend Alternative", "in 2026: Reloop"],
	description:
		"Reloop is the open-source Resend alternative for 2026: same developer DX with self-hosting, $10/50k send-based pricing, own MTA, and an agent inbox.",
	keywords: [
		"Resend alternative",
		"best Resend alternative",
		"Resend alternatives 2026",
		"open source Resend alternative",
		"self-hosted Resend alternative",
		"Resend competitor",
		"Reloop vs Resend",
	],
	updatedAt: "September 17, 2026",
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Full comparison",
		href: "/compare/resend",
	},
	highlights: [
		"Apache 2.0 open-source codebase you can audit and self-host",
		"$10/mo for 50,000 emails vs Resend $20 — $0.50 vs $0.90 per 1k overage",
		"Campaigns, SMTP relay, human inbox, and agent inbox — not just transactional API",
		"Own MTA delivery path (KumoMTA), not an SES wrapper",
		"Same REST API ergonomics with official SDKs for every major language",
		"Hosted by Reloop Labs or deploy on your own infrastructure",
	],
	sections: [
		{
			title: "Why teams switch from Resend",
			items: [
				{
					title: "Ownership",
					description:
						"Read the source, run your own stack, or use hosted. Your data, your choice.",
				},
				{
					title: "One platform",
					description:
						"Transactional, marketing, and AI agent email without adding vendors.",
				},
				{
					title: "Transparent pricing",
					description:
						"Free tier to start; self-host for unlimited sends on your hardware.",
				},
			],
		},
	],
	cta: {
		title: "Try the Resend alternative",
		titleMuted: "Start free today.",
		description: "Migrate in an afternoon with SDKs and SMTP compatibility.",
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
			question: "What is the best Resend alternative in 2026?",
			answer:
				"Reloop is the best open-source Resend alternative for teams that want self-hosting, send-based pricing ($10/month for 50,000 emails vs Resend $20), and an agent inbox alongside transactional and marketing email — hosted or self-hosted from one Apache 2.0 codebase.",
		},
		{
			question: "Is there an open-source Resend alternative?",
			answer:
				"Yes — Reloop. It is Apache 2.0 licensed (plus Reloop Labs use terms), runs its own MTA stack, and can be self-hosted with no Reloop license fee. Resend is hosted-only proprietary software.",
		},
		{
			question: "How much can we save switching from Resend to Reloop?",
			answer:
				"At 50,000 emails/month: $10 on Reloop Pro vs $20 on Resend. At 100,000/month: $20 on Reloop Growth vs roughly $90 on Resend. Overage is $0.50 vs $0.90 per 1,000. Prices are public list prices as of September 17, 2026.",
		},
		{
			question: "Is Reloop a drop-in Resend replacement?",
			answer:
				"No — plan a small client adapter (auth uses x-api-key with rl_ keys). SMTP senders only change host, port, and credentials. Templates and webhooks map across in an afternoon.",
		},
		{
			question: "When should we stay on Resend?",
			answer:
				"Stay on Resend if a hosted-only API plus Audiences already fits, your volume is low, and you have no need for source access, self-hosting, or inbound agent workflows.",
		},
	],
};
