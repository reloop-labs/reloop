"use client";

import * as Accordion from "@reloop/ui/accordion";

const faqCategories = [
	{
		name: "General",
		questions: [
			{
				question: "What is Reloop?",
				answer:
					"Reloop is a secure, reliable, and scalable email infrastructure platform designed for developers and marketing teams. We provide 99.9% inbox placement with sub-900ms latency and complete transparency through our open-source platform.",
			},
			{
				question: "What email providers are supported?",
				answer:
					"Reloop supports all major email providers and SMTP servers. Our platform is designed to work with any email service that uses standard SMTP protocols, ensuring maximum compatibility and flexibility.",
			},
			{
				question: "Who can benefit from using Reloop?",
				answer:
					"Reloop is ideal for developers building applications that require email functionality, marketing teams managing large-scale email campaigns, and businesses that need reliable email delivery without vendor lock-in.",
			},
			{
				question: "Is Reloop open-source?",
				answer:
					"Yes, Reloop is open-source. You can view our codebase on GitHub, audit it for security, and even contribute to the project. This ensures complete transparency and gives you full control over your email infrastructure.",
			},
			{
				question:
					"What is the difference between Reloop and other email services?",
				answer:
					"Reloop offers several key advantages: open-source architecture for complete transparency, sub-900ms delivery latency, 99.9% inbox placement rates, no vendor lock-in, and end-to-end encryption. Unlike proprietary solutions, you maintain full control over your email infrastructure.",
			},
			{
				question:
					"What is the difference between the open-source version and the hosted version?",
				answer:
					"The open-source version gives you complete control to self-host and customize Reloop to your needs. The hosted version provides managed infrastructure with automatic updates, scaling, and support, while maintaining the same open-source codebase and transparency.",
			},
		],
	},
	{
		name: "Infrastructure & Delivery",
		questions: [
			{
				question: "How does Reloop handle email delivery?",
				answer:
					"Reloop uses advanced email delivery infrastructure with intelligent routing, automatic retries, and delivery optimization. Our platform monitors delivery rates in real-time and adjusts routing to ensure maximum inbox placement.",
			},
			{
				question: "Why is delivery latency so low?",
				answer:
					"Reloop achieves sub-900ms delivery latency through optimized infrastructure, direct connections to major email providers, and efficient routing algorithms. Our platform is built from the ground up for speed and reliability.",
			},
		],
	},
];

const Faq = () => {
	return (
		<div className="border-stroke-soft-100 border-t">
			<div className="mx-auto max-w-7xl border-stroke-soft-100 border-r border-l">
				<div className="flex items-center justify-between border-stroke-soft-100 border-b px-10 py-4">
					<span className="text-sm text-text-sub-600">[05] FAQ</span>
					<span className="text-sm text-text-sub-600">
						/ QUESTIONS & ANSWERS
					</span>
				</div>
				<div className="flex-1">
					{faqCategories.map((category, categoryIndex) => (
						<div key={categoryIndex} className="flex">
							<div className="w-3xl border-stroke-soft-100 border-r border-b">
								<p className="border-b border-b-stroke-soft-100 px-10 py-6 font-semibold text-2xl text-text-strong-950">
									{category.name}
								</p>
							</div>
							<Accordion.Root type="single" collapsible className="w-full">
								{category.questions.map((faq, questionIndex) => {
									const itemValue = `${categoryIndex}-${questionIndex}`;
									return (
										<Accordion.Item
											className="rounded-none border-stroke-soft-100 border-b bg-transparent p-0! ring-0 hover:bg-transparent has-[:focus-visible]:bg-transparent data-[state=open]:bg-transparent"
											value={itemValue}
											key={questionIndex}
										>
											<Accordion.Trigger className="flex w-full items-center justify-between px-10 py-7 text-left font-medium text-base">
												{faq.question}
												<Accordion.Arrow />
											</Accordion.Trigger>
											<Accordion.Content className="-mt-3 px-10 pb-4">
												{faq.answer}
											</Accordion.Content>
										</Accordion.Item>
									);
								})}
							</Accordion.Root>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default Faq;
