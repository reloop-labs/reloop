"use client";

import { cn } from "@reloop/fe-docs/lib/cn";
import * as React from "react";

const AccordionGroupContext = React.createContext<boolean>(false);

export function AccordionGroup({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<AccordionGroupContext.Provider value={true}>
			<div
				className={cn(
					"my-6 overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 divide-y divide-stroke-soft-200 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a] dark:divide-stroke-soft-100/40",
					className,
				)}
			>
				{children}
			</div>
		</AccordionGroupContext.Provider>
	);
}

export function Accordion({
	title,
	children,
	defaultOpen = false,
	className,
}: {
	title?: React.ReactNode;
	children?: React.ReactNode;
	defaultOpen?: boolean;
	className?: string;
}) {
	const [isOpen, setIsOpen] = React.useState(defaultOpen);
	const isInGroup = React.useContext(AccordionGroupContext);

	const itemContent = (
		<div className={cn("group transition-colors", className)}>
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				aria-expanded={isOpen}
				className="flex w-full items-center gap-3 px-6 py-4 text-left font-medium text-[15px] text-[#171717] transition-colors hover:bg-bg-weak-50/60 dark:text-white dark:hover:bg-white/[0.03]"
			>
				<svg
					className={cn(
						"h-2.5 w-2.5 shrink-0 fill-current text-text-sub-600 transition-transform duration-200",
						isOpen && "rotate-90 text-[#171717] dark:text-white",
					)}
					viewBox="0 0 24 24"
				>
					<path d="M8 5v14l11-7z" />
				</svg>
				<span className="flex-1">{title}</span>
			</button>
			{isOpen && (
				<div className="px-6 pt-1 pb-5 text-[15px] text-text-sub-600 leading-relaxed pl-[44px] [&>p]:m-0 [&>p+p]:mt-3">
					{children}
				</div>
			)}
		</div>
	);

	if (!isInGroup) {
		return (
			<div className="my-4 overflow-hidden rounded-xl border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]">
				{itemContent}
			</div>
		);
	}

	return itemContent;
}

(Accordion as any).Group = AccordionGroup;
