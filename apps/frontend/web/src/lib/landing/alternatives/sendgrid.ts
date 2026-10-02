import type { AlternativeDefinition } from "../types";

export const config: AlternativeDefinition = {
	slug: "sendgrid",
	path: "/alternatives/sendgrid",
	competitorName: "SendGrid",
	compareHref: "/compare/sendgrid",
	titleLines: ["Best SendGrid Alternative", "in 2026: Reloop"],
	description:
		"Reloop is the open-source SendGrid alternative for 2026: API-first email with self-hosting, $10/50k monthly tiers, and an agent inbox — no annual commit.",
	keywords: [
		"SendGrid alternative",
		"best SendGrid alternative",
		"SendGrid alternatives 2026",
		"SendGrid competitor",
		"open source SendGrid alternative",
		"self-hosted SendGrid alternative",
		"cheaper SendGrid alternative",
		"Reloop vs SendGrid",
	],
	updatedAt: "September 17, 2026",
	primaryCta: {
		label: "Get started free",
		href: "/dashboard/signup",
	},
	secondaryCta: {
		label: "Full comparison",
		href: "/compare/sendgrid",
	},
	highlights: [
		"$10/mo for 50,000 emails vs ~$19.95 Essentials — monthly, no annual commit",
		"Simpler API and dashboard without legacy Twilio baggage",
		"Self-hostable Apache 2.0 core, with no per-email lock-in",
		"Campaigns and transactional on one platform, one template source",
		"Agent inbox and modern TypeScript-first SDKs",
		"Hosted by Reloop Labs or deploy on your own infrastructure",
	],
	sections: [
		{
			title: "Why teams leave SendGrid",
			items: [
				{
					title: "Pricing clarity",
					description:
						"Predictable tiers without surprise overages on legacy plans.",
				},
				{
					title: "Modern DX",
					description:
						"Clean APIs, webhooks, and docs built for 2026, not 2012.",
				},
				{
					title: "Open source",
					description:
						"No black box. Inspect routing, quotas, and delivery logic.",
				},
			],
		},
	],
	cta: {
		title: "Switch from SendGrid",
		titleMuted: "Start free today.",
		description: "SMTP-compatible relay makes migration straightforward.",
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
			question: "What is the best SendGrid alternative in 2026?",
			answer:
				"Reloop is the best open-source SendGrid alternative for teams choosing actively: API-first transactional plus marketing email, self-hosting, $10/month for 50,000 emails with no annual commit, and an agent inbox — hosted or self-hosted from one Apache 2.0 codebase.",
		},
		{
			question: "Why do teams leave SendGrid?",
			answer:
				"Annual commits and sales-assisted upgrades, UI/API drift between marketing dashboards and engineering APIs, no self-host option for regulated data, and AI agent workflows that need third-party tooling on top of SendGrid events.",
		},
		{
			question: "How much can we save switching from SendGrid?",
			answer:
				"At 50,000 emails/month: $10 on Reloop Pro vs around $19.95 on SendGrid Essentials. At 100,000/month: $20 on Reloop Growth vs roughly $34.95 — before annual commits. Prices are public list prices as of September 17, 2026.",
		},
		{
			question: "How do subusers and templates migrate?",
			answer:
				"Map subusers, API keys, and IP pools to Reloop orgs, export dynamic templates and segments, rebuild automations in Reloop campaigns or API triggers, then run shadow traffic in staging before cutover. Plan an afternoon per domain plus template QA.",
		},
		{
			question: "When should we stay on SendGrid?",
			answer:
				"Stay if subusers, IP pools, and deliverability tooling are tuned, your commit pricing is favorable, and you have no need for source access or self-hosting.",
		},
	],
};
