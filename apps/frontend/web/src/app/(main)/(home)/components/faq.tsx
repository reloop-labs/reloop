"use client";

import { cn } from "@reloop/ui/cn";
import { useState } from "react";

const faqItems = [
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
		question: "What is the difference between Reloop and other email services?",
		answer:
			"Reloop offers several key advantages: open-source architecture for complete transparency, sub-900ms delivery latency, 99.9% inbox placement rates, no vendor lock-in, and end-to-end encryption. Unlike proprietary solutions, you maintain full control over your email infrastructure.",
	},
	{
		question:
			"What is the difference between the open-source version and the hosted version?",
		answer:
			"The open-source version gives you complete control to self-host and customize Reloop to your needs. The hosted version provides managed infrastructure with automatic updates, scaling, and support, while maintaining the same open-source codebase and transparency.",
	},
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
];

const Faq = () => {
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	return (
		<section id="faq" className="bg-[#f8f8f8] text-[#0a0d12]">
			<div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
				<div className="text-center">
					<p className="font-semibold text-black/40 text-sm uppercase tracking-wide">
						FAQ
					</p>
					<h2 className="mt-4 font-medium text-4xl tracking-tighter sm:text-5xl lg:text-6xl">
						Question & Answer
					</h2>
				</div>
				<div className="mt-14 divide-y divide-[#0a0d12]/10 sm:mt-16">
					{faqItems.map((faq, i) => (
						<div key={i}>
							<button
								type="button"
								onClick={() => setOpenIndex(openIndex === i ? null : i)}
								className="flex w-full items-start justify-between gap-4 py-6 text-left"
							>
								<span className="font-semibold text-[#0a0d12] text-[16px] leading-snug sm:text-[17px]">
									{faq.question}
								</span>
								<span
									className={cn(
										"mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-[#0a0d12]/12 text-[#0a0d12]/40 transition-transform",
										openIndex === i && "rotate-45",
									)}
								>
									<svg
										width="12"
										height="12"
										viewBox="0 0 12 12"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.5"
										strokeLinecap="round"
									>
										<path d="M6 1v10M1 6h10" />
									</svg>
								</span>
							</button>
							<div
								className={cn(
									"grid transition-[grid-template-rows] duration-200 ease-out",
									openIndex === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
								)}
							>
								<div className="overflow-hidden">
									<p className="pr-12 pb-6 text-[#0a0d12]/56 text-[14px] leading-[1.7] sm:text-[15px]">
										{faq.answer}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default Faq;
