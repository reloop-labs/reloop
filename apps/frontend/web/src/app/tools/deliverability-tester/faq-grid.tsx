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
	const allItems: FaqItem[] = groups ? groups.flatMap((g) => g.items) : [];
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	const toggle = (index: number) => {
		setOpenIndex((prev) => (prev === index ? null : index));
	};

	return (
		<div id={id} className="mx-auto max-w-4xl px-5 py-8 sm:px-6 sm:py-12 md:px-8">
			<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 divide-y divide-stroke-soft-200 shadow-xs dark:border-white/10 dark:divide-white/10 dark:bg-[#0b0b0b]">
				{allItems.map((faq, index) => {
					const isOpen = openIndex === index;

					return (
						<div key={faq.question} className="group transition-colors">
							<button
								type="button"
								onClick={() => toggle(index)}
								aria-expanded={isOpen}
								className="flex w-full items-center gap-3 px-6 py-4 text-left font-medium text-[15px] text-text-strong-950 transition-colors hover:bg-bg-weak-50/60 dark:text-white dark:hover:bg-white/[0.03]"
							>
								<svg
									className={cn(
										"size-2.5 shrink-0 fill-current text-text-sub-600 transition-transform duration-200 dark:text-white/40",
										isOpen && "rotate-90 text-text-strong-950 dark:text-white",
									)}
									viewBox="0 0 24 24"
									aria-hidden="true"
								>
									<path d="M8 5v14l11-7z" />
								</svg>
								<span className="flex-1 leading-snug">{faq.question}</span>
							</button>

							{isOpen && (
								<div className="px-6 pt-1 pb-5 pl-[44px] text-[14.5px] text-text-sub-600 leading-relaxed dark:text-white/60">
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
