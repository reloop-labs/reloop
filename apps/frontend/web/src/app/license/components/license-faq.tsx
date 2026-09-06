import { FaqSection } from "@reloop/web/components/faq-section";

const licenseFaqItems = [
	{
		question: "What license is Reloop under?",
		answer:
			"Apache License 2.0 with additional use restrictions from Reloop Labs. You get all Apache 2.0 freedoms for personal and internal use, plus a few commercial limits.",
	},
	{
		question: "Can I use Reloop inside my company?",
		answer:
			"Yes. Internal business use — including across your team, modified for internal needs, and self-hosted privately — is free with no Reloop license fee.",
	},
	{
		question: "Can I resell or offer Reloop as a hosted service?",
		answer:
			"No. Selling, sublicensing, commercial redistribution, or offering Reloop (or a modified version) as SaaS, PaaS, or similar hosting needs written permission from Reloop Labs.",
	},
	{
		question: "Is self-hosting really free?",
		answer:
			"Yes for personal and internal use. Deploy on your own infrastructure at no Reloop license cost — you only pay for your own servers and delivery infrastructure.",
	},
	{
		question: "Who do I contact about a commercial license?",
		answer:
			"Email reloop.sh@gmail.com for questions about the license, commercial use, or competing-use exceptions.",
	},
];

export function LicenseFaq() {
	return (
		<>
			<div aria-hidden className="h-24" />
			<div className="border-stroke-soft-100 border-b dark:border-white/10 [&_.t-acc:last-child]:border-b-0">
				<FaqSection items={licenseFaqItems} id="license-faq" compact flush />
			</div>
		</>
	);
}
