"use client";

import { cn } from "@reloop/ui/cn";
import { useState } from "react";

export type FaqItem = {
	question: string;
	answer: string;
};

export function FaqSection({
	items,
	eyebrow = "FAQ",
	title = "Question & Answer",
	id = "faq",
	compact = false,
	plain = false,
}: {
	items: FaqItem[];
	eyebrow?: string;
	title?: string;
	id?: string;
	compact?: boolean;
	plain?: boolean;
}) {
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	return (
		<section id={id} className="text-[#0a0d12] dark:text-white">
			<div
				className={`mx-auto max-w-3xl px-4 sm:px-6 ${compact ? "py-12 sm:py-14" : "py-16 sm:px-6 sm:py-20 lg:py-24"}`}
			>
				<div className="text-center">
					<p className="font-semibold text-[11px] text-text-sub-600 uppercase tracking-[0.16em]">
						{eyebrow}
					</p>
					<h2
						className={`font-serif text-[2.6rem] text-text-strong-950 leading-[1.05] tracking-tighter sm:text-[3.4rem] lg:text-[4.2rem] dark:text-white ${compact ? "mt-3.5" : "mt-4"}`}
					>
						{title}
					</h2>
				</div>
				<div
					className={`divide-y divide-[#0a0d12]/10 dark:divide-white/10 ${compact ? "mt-10 sm:mt-12" : "mt-14 sm:mt-16"}`}
				>
					{items.map((faq, i) => (
						<div key={faq.question}>
							<button
								type="button"
								onClick={() => setOpenIndex(openIndex === i ? null : i)}
								className={`flex w-full items-start justify-between gap-4 text-left ${compact ? "py-5" : "py-6"}`}
							>
								<span className="font-semibold text-[16px] text-text-strong-950 leading-snug sm:text-[17px] dark:text-white">
									{faq.question}
								</span>
								<span
									className={cn(
										"mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-[#0a0d12]/12 text-[#0a0d12]/40 transition-transform dark:border-white/12 dark:text-white/55",
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
										aria-hidden
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
									<p
										className={`pr-12 text-[#0a0d12]/56 text-[14px] leading-[1.7] sm:text-[15px] dark:text-white/50 ${compact ? "pb-5" : "pb-6"}`}
									>
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
}
