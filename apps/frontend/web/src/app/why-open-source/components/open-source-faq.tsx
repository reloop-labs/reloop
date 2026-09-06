import { FaqSection } from "@reloop/web/components/faq-section";

const openSourceFaqItems = [
	{
		question: "Is Reloop really open source?",
		answer:
			"Yes. The code is public on GitHub under Apache 2.0 with Reloop Labs use restrictions — no black-box claims, verify everything in code.",
	},
	{
		question: "What license does Reloop use?",
		answer:
			"Apache License 2.0 with additional use restrictions: free for personal and internal use, including self-hosting. Reselling or hosted offerings need permission. See the license page for the full text.",
	},
	{
		question: "Can I self-host Reloop?",
		answer:
			"Yes. Deploy on your own infrastructure at no Reloop license cost for personal and internal use — you only pay for your own servers and delivery infrastructure.",
	},
	{
		question: "How is this different from closed email providers?",
		answer:
			"Most providers run the same open-source parts behind proprietary marketing. Reloop gives you the repo itself, plus the managed part open source leaves out: DNS, queues, retries, and monitoring, done.",
	},
	{
		question: "Do you offer a hosted version?",
		answer:
			"Yes. Reloop Cloud at reloop.sh is the fully managed option. Prefer to run it yourself? Self-host the same open-source software on your own infra.",
	},
];

export function OpenSourceFaq() {
	return (
		<>
			<div aria-hidden className="h-24" />
			<div className="border-stroke-soft-100 border-b dark:border-white/10 [&_.t-acc:last-child]:border-b-0">
				<FaqSection
					items={openSourceFaqItems}
					id="open-source-faq"
					compact
					flush
				/>
			</div>
		</>
	);
}
