"use client";

import { cn } from "@reloop/ui/cn";
import type { FaqItem } from "@reloop/web/components/faq-section";
import { useState } from "react";
import { hairline } from "./grid";

export function FaqGrid({
	groups,
	id = "faq",
}: {
	groups: { title: string; items: FaqItem[] }[];
	id?: string;
}) {
	const [open, setOpen] = useState<string | null>(null);

	return (
		<div id={id}>
			{groups.map((group) => (
				<div
					key={group.title}
					className={cn("grid border-t md:grid-cols-2", hairline)}
				>
					<div className="px-5 pt-8 pb-2 sm:px-6 md:px-8 md:py-10">
						<h3 className="font-semibold text-[19px] text-text-strong-950 tracking-tight sm:text-[21px] dark:text-white">
							{group.title}
						</h3>
					</div>

					<div className={cn("md:border-l", hairline)}>
						{group.items.map((faq) => {
							const isOpen = open === faq.question;

							return (
								<div
									key={faq.question}
									className={cn("border-t first:border-t-0", hairline)}
								>
									<button
										type="button"
										onClick={() => setOpen(isOpen ? null : faq.question)}
										aria-expanded={isOpen}
										className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left sm:px-6 md:px-8"
									>
										<span className="font-medium text-[15px] text-text-strong-950 leading-snug sm:text-[16px] dark:text-white">
											{faq.question}
										</span>
										<span
											className={cn(
												"mt-0.5 flex size-5 shrink-0 items-center justify-center text-text-soft-400 transition-transform duration-200 dark:text-white/35",
												isOpen && "rotate-45 text-primary-base",
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
											isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
										)}
									>
										<div className="overflow-hidden">
											<p className="px-5 pb-6 text-[14px] text-text-sub-600 leading-[1.7] sm:px-6 sm:text-[15px] md:px-8 dark:text-white/50">
												{faq.answer}
											</p>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			))}
		</div>
	);
}
