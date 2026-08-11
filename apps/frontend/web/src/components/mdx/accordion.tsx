"use client";

import { cn } from "@reloop/ui/cn";
import {
	createContext,
	type ReactNode,
	useContext,
	useId,
	useState,
} from "react";

const AccordionGroupContext = createContext(false);

export function AccordionGroup({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<AccordionGroupContext.Provider value={true}>
			<div
				className={cn(
					"my-5 divide-y divide-stroke-soft-200 overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 dark:divide-stroke-soft-100/40 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]",
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
	title?: ReactNode;
	children?: ReactNode;
	defaultOpen?: boolean;
	className?: string;
}) {
	const [isOpen, setIsOpen] = useState(defaultOpen);
	const isInGroup = useContext(AccordionGroupContext);
	const panelId = useId();

	const item = (
		<div className={cn("group transition-colors", className)}>
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				aria-expanded={isOpen}
				aria-controls={panelId}
				className={cn(
					"flex w-full items-center gap-2.5 px-4 py-2.5 text-left font-medium text-[14px] text-text-strong-950 transition-colors hover:bg-bg-weak-50/60 sm:text-[15px] dark:text-white dark:hover:bg-white/[0.03]",
					isOpen && "pb-1.5",
				)}
			>
				<span
					className={cn(
						"flex size-4 shrink-0 items-center justify-center rounded-full border border-stroke-soft-200 text-text-sub-400 transition-transform duration-200 dark:border-white/12 dark:text-white/50",
						isOpen &&
							"rotate-45 border-stroke-soft-200 text-text-strong-950 dark:text-white",
					)}
					aria-hidden
				>
					<svg
						width="8"
						height="8"
						viewBox="0 0 12 12"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.75"
						strokeLinecap="round"
					>
						<path d="M6 1v10M1 6h10" />
					</svg>
				</span>
				<span className="flex-1 leading-snug">{title}</span>
			</button>
			<div
				id={panelId}
				className={cn(
					"grid transition-[grid-template-rows] duration-200 ease-out",
					isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
				)}
			>
				<div className="overflow-hidden">
					<div
						className={cn(
							"px-4 pr-4 pb-3 pl-[34px] text-[13px] text-text-sub-600 leading-snug sm:text-[14px] dark:text-white/55",
							// Collapse MDX paragraph / list spacing so answers sit tight under the title
							"[&_:first-child]:mt-0! [&>p]:my-0! [&>p+p]:mt-2! [&_ul]:my-2! [&_ol]:my-2! [&_li]:my-0.5!",
							"[&_a]:underline [&_a]:underline-offset-2",
							"[&_code]:rounded-md [&_code]:bg-bg-weak-50 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[11px] dark:[&_code]:bg-white/5",
						)}
					>
						{children}
					</div>
				</div>
			</div>
		</div>
	);

	if (!isInGroup) {
		return (
			<div className="my-3 overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]">
				{item}
			</div>
		);
	}

	return item;
}
