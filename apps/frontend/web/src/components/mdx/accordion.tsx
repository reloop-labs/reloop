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
					"my-6 divide-y divide-stroke-soft-200 overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 dark:divide-stroke-soft-100/40 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]",
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
				className="flex w-full items-center gap-3 px-5 py-4 text-left font-medium text-[15px] text-text-strong-950 transition-colors hover:bg-bg-weak-50/60 sm:px-6 dark:text-white dark:hover:bg-white/[0.03]"
			>
				<span
					className={cn(
						"mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-stroke-soft-200 text-text-sub-400 transition-transform duration-200 dark:border-white/12 dark:text-white/50",
						isOpen && "rotate-45 border-stroke-soft-200 text-text-strong-950 dark:text-white",
					)}
					aria-hidden
				>
					<svg
						width="10"
						height="10"
						viewBox="0 0 12 12"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
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
					<div className="px-5 pt-0 pb-5 pl-[52px] text-[14px] text-text-sub-600 leading-relaxed sm:px-6 sm:pl-[56px] sm:text-[15px] dark:text-white/55 [&>p+p]:mt-3 [&>p]:m-0 [&_a]:underline [&_a]:underline-offset-2 [&_code]:rounded-md [&_code]:bg-bg-weak-50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12px] dark:[&_code]:bg-white/5">
						{children}
					</div>
				</div>
			</div>
		</div>
	);

	if (!isInGroup) {
		return (
			<div className="my-4 overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-[#0a0a0a]">
				{item}
			</div>
		);
	}

	return item;
}
