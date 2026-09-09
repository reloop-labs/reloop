"use client";

import { cn } from "@reloop/ui/cn";
import type { FaqItem } from "@reloop/web/components/faq-section";
import React, { useState } from "react";

export function FaqGrid({
	groups,
	id = "faq",
}: {
	groups?: { title: string; items: FaqItem[] }[];
	items?: FaqItem[];
	id?: string;
}) {
	// Flatten all FAQs into a single unified list matching the docs style
	const allItems: FaqItem[] = groups ? groups.flatMap((g) => g.items) : [];

	const [openIndex, setOpenIndex] = useState<number | null>(null);

	const toggle = (index: number) => {
		setOpenIndex((prev) => (prev === index ? null : index));
	};

	return (
		<div
			id={id}
			className="mx-auto max-w-4xl px-5 py-8 sm:px-6 sm:py-12 md:px-8"
		>
			<div className="divide-y divide-stroke-soft-200 overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-xs dark:divide-white/10 dark:border-white/10 dark:bg-[#0b0b0b]">
				{allItems.map((faq, index) => {
					const isOpen = openIndex === index;

					return (
						<div key={faq.question} className="group transition-colors">
							<button
								type="button"
								onClick={() => toggle(index)}
								aria-expanded={isOpen}
								className="flex min-h-[60px] w-full cursor-pointer items-center justify-between gap-4 px-6 py-4 text-left font-medium text-[15px] text-text-strong-950 transition-colors hover:bg-bg-weak-50/60 dark:text-white dark:hover:bg-white/[0.03]"
							>
								<span className="flex-1 leading-snug">{faq.question}</span>
								<span
									className={cn(
										"flex size-7 shrink-0 items-center justify-center rounded-full border border-[#0a0d12]/12 text-[#0a0d12]/40 dark:border-white/12 dark:text-white/55",
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

							{isOpen && (
								<div className="px-6 pt-1 pb-5 text-[14.5px] text-text-sub-600 leading-relaxed dark:text-white/60">
									<p className="m-0">{faq.answer}</p>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
