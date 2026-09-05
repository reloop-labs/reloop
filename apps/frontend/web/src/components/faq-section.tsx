"use client";

import { cn } from "@reloop/ui/cn";
import { useId, useState } from "react";

export type FaqItem = {
	question: string;
	answer: string;
};

/** Matches the pricing comparison table: label column + remaining track. */
const FAQ_GRID =
	"grid lg:grid-cols-[minmax(220px,1.45fr)_repeat(4,minmax(0,1fr))]";

export function FaqSection({
	items,
	eyebrow = "FAQ",
	title = "Frequently asked questions.",
	id = "faq",
	compact = false,
	plain = false,
	flush = false,
}: {
	items: FaqItem[];
	eyebrow?: string;
	title?: string;
	id?: string;
	compact?: boolean;
	plain?: boolean;
	flush?: boolean;
}) {
	const [openIndex, setOpenIndex] = useState<number | null>(null);
	const reactId = useId();

	return (
		<section
			id={id}
			className={cn(
				"text-text-strong-950 dark:text-white",
				!plain && "border-stroke-soft-100 border-t dark:border-white/10",
				!flush && "mx-auto w-full max-w-5xl md:max-w-7xl",
			)}
		>
			<div className={FAQ_GRID}>
				<header
					className={cn(
						"flex flex-col gap-3 border-stroke-soft-100 border-b px-5 sm:px-7 lg:sticky lg:top-16 lg:self-start lg:border-b-0 lg:px-9 dark:border-white/10",
						compact ? "py-8 lg:py-10" : "py-10 lg:py-12",
					)}
				>
					<p className="font-medium text-[12px] text-primary-base uppercase">
						{eyebrow}
					</p>
					<h2 className="font-medium text-[1.45rem] text-text-strong-950 leading-[1.12] tracking-tight sm:text-[1.7rem] dark:text-white">
						{title}
					</h2>
				</header>

				<div className="col-span-full border-stroke-soft-100 lg:col-span-4 lg:border-l dark:border-white/10">
					{items.map((faq, i) => {
						const isOpen = openIndex === i;
						const panelId = `${id}-${reactId}-panel-${i}`;
						const buttonId = `${id}-${reactId}-button-${i}`;

						return (
							<div
								key={faq.question}
								className="t-acc border-stroke-soft-100 border-b dark:border-white/[0.07]"
								data-open={isOpen ? "true" : "false"}
							>
								<button
									type="button"
									id={buttonId}
									aria-expanded={isOpen}
									aria-controls={panelId}
									onClick={() => setOpenIndex(isOpen ? null : i)}
									className="t-acc-head flex min-h-[60px] w-full cursor-pointer items-center justify-between gap-4 px-5 py-5 text-left transition-colors duration-150 hover:bg-bg-weak-50/70 focus-visible:bg-bg-weak-50/70 focus-visible:outline-none sm:px-6 lg:px-8 dark:focus-visible:bg-white/[0.03] dark:hover:bg-white/[0.03]"
								>
									<span className="font-medium text-[15px] text-text-strong-950 leading-snug dark:text-white">
										{faq.question}
									</span>
									<span
										className={cn(
											"t-acc-plus mt-px flex size-7 shrink-0 items-center justify-center rounded-full border border-[#0a0d12]/12 text-[#0a0d12]/40 dark:border-white/12 dark:text-white/55",
											isOpen && "text-text-strong-950 dark:text-white",
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
								<section
									className="t-acc-panel"
									id={panelId}
									aria-labelledby={buttonId}
								>
									<div className="t-acc-panel-inner">
										<p className="px-5 pt-0 pr-14 pb-5 text-[14px] text-text-sub-600 leading-[1.7] sm:px-6 sm:pr-16 sm:text-[15px] lg:px-8 dark:text-white/50">
											{faq.answer}
										</p>
									</div>
								</section>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
