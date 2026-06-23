import { FaqSection } from "@reloop/web/components/faq-section";

const pricingFaqItems = [
	{
		question: "What counts as an email?",
		answer:
			"Each successfully sent email counts toward your monthly quota—transactional messages, campaign sends, and SMTP relay deliveries all use credits the same way.",
	},
	{
		question: "Do I need a credit card to start?",
		answer:
			"No. The Free plan includes 3,000 emails per month with no credit card required. Upgrade when your volume grows.",
	},
	{
		question: "What happens if I exceed my monthly limit?",
		answer:
			"On paid plans, overage emails are billed at the per-thousand rate listed for your tier. On the Free plan, sending pauses until the next billing period unless you upgrade.",
	},
	{
		question: "Is self-hosting really free?",
		answer:
			"Yes. Reloop is open source under Apache 2.0 with Reloop Labs use restrictions. You can deploy on your own infrastructure at no license cost—you pay only for your servers and email delivery infrastructure.",
	},
	{
		question: "Is hosted pricing different from self-hosted?",
		answer:
			"We believe in pricing parity: the same transparent tiers apply whether Reloop hosts your stack or you run it yourself. No hidden platform fees for choosing one deployment path over the other.",
	},
	{
		question: "Can I switch plans at any time?",
		answer:
			"Yes. Upgrade or downgrade from your dashboard. Plan changes apply to the current billing period according to your subscription settings.",
	},
];

export function PricingFaq() {
	return <FaqSection items={pricingFaqItems} id="pricing-faq" compact />;
}
