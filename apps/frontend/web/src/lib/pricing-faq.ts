export type PricingFaqItem = {
	question: string;
	answer: string;
};

/** Canonical pricing FAQ — UI and JSON-LD must stay in lockstep. */
export const pricingFaqItems: PricingFaqItem[] = [
	{
		question: "What counts as an email?",
		answer:
			"Each successfully sent email counts toward your monthly quota—transactional messages, campaign sends, and SMTP relay deliveries all use credits the same way.",
	},
	{
		question: "Do I need a credit card to start?",
		answer:
			"No. The Free plan includes 3,000 emails per month and 200 emails per day, with no credit card required. Upgrade when your volume grows.",
	},
	{
		question: "What happens if I exceed my monthly limit?",
		answer:
			"On paid plans, overage emails are billed at $0.80 per 1,000. On the Free plan, sending pauses at 3,000 emails per month or 200 emails per day until the next period unless you upgrade. Free has no overage.",
	},
	{
		question: "Is self-hosting really free?",
		answer:
			"Yes. Reloop is open source under Apache 2.0 with Reloop Labs use restrictions. You can deploy on your own infrastructure at no Reloop license cost—you pay only for your servers and email delivery infrastructure. Self-host is not a Reloop Cloud subscription.",
	},
	{
		question: "Is hosted pricing different from self-hosted?",
		answer:
			"Yes. Reloop Cloud (hosted) uses the published Free, Individual ($10/mo), Startup ($20/mo), and Enterprise tiers. Self-hosting the Apache 2.0 stack has no Reloop SaaS fee—it is not the same as buying those hosted plans for your own servers.",
	},
	{
		question: "Can I switch plans at any time?",
		answer:
			"Yes. Upgrade or downgrade from your dashboard. Plan changes apply to the current billing period according to your subscription settings.",
	},
];
