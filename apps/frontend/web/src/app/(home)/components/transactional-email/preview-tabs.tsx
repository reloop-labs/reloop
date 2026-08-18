"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { PreviewTabId } from "./preview-scenes";
import { PREVIEW_TABS } from "./preview-scenes";

function ReactEmailIcon({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			className={className}
			aria-hidden="true"
		>
			<ellipse cx="12" cy="12" rx="10" ry="4.5" />
			<ellipse
				cx="12"
				cy="12"
				rx="10"
				ry="4.5"
				transform="rotate(60 12 12)"
			/>
			<ellipse
				cx="12"
				cy="12"
				rx="10"
				ry="4.5"
				transform="rotate(120 12 12)"
			/>
			<circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
		</svg>
	);
}

export function PreviewTabs({
	active,
	onChange,
}: {
	active: PreviewTabId;
	onChange: (id: PreviewTabId) => void;
}) {
	const shouldReduceMotion = useReducedMotion();

	return (
		<div
			role="tablist"
			aria-label="Transactional features"
			className="grid border-stroke-soft-200 border-t bg-bg-white-0 sm:grid-cols-3 dark:border-white/10 dark:bg-black"
		>
			{PREVIEW_TABS.map((tab) => {
				const selected = tab.id === active;
				return (
					<div
						key={tab.id}
						role="tab"
						aria-selected={selected}
						tabIndex={selected ? 0 : -1}
						onClick={() => onChange(tab.id)}
						onKeyDown={(event) => {
							if (event.key === "Enter" || event.key === " ") {
								event.preventDefault();
								onChange(tab.id);
							}
						}}
						className={cn(
							"group relative cursor-pointer px-5 py-6 text-left transition-colors duration-200 sm:border-stroke-soft-200 sm:border-l sm:px-6 sm:py-7 sm:first:border-l-0 dark:sm:border-white/10",
							"hover:bg-bg-weak-50/50 dark:hover:bg-white/[0.02]",
						)}
					>
						{selected && (
							<motion.span
								layoutId={
									shouldReduceMotion
										? undefined
										: "transactional-tab-indicator"
								}
								className="absolute right-0 bottom-0 left-0 z-10 h-0.5 bg-primary-base"
								transition={
									shouldReduceMotion
										? { duration: 0 }
										: { type: "spring", bounce: 0, duration: 0.28 }
								}
							/>
						)}
						{tab.id === "templates" ? (
							<ReactEmailIcon
								className={cn(
									"size-4 transition-colors duration-200",
									selected
										? "text-text-strong-950 dark:text-white"
										: "text-text-soft-400 group-hover:text-text-sub-600 dark:text-white/30 dark:group-hover:text-white/60",
								)}
							/>
						) : (
							<Icon
								name={tab.icon!}
								className={cn(
									"size-4 transition-colors duration-200",
									selected
										? "text-text-strong-950 dark:text-white"
										: "text-text-soft-400 group-hover:text-text-sub-600 dark:text-white/30 dark:group-hover:text-white/60",
								)}
							/>
						)}
						<p
							className={cn(
								"mt-3 font-semibold text-[15px] tracking-tight transition-colors duration-200",
								selected
									? "text-text-strong-950 dark:text-white"
									: "text-text-sub-600 group-hover:text-text-strong-950 dark:text-white/40 dark:group-hover:text-white/80",
							)}
						>
							{tab.title}
						</p>
						<p
							className={cn(
								"mt-2 max-w-[18rem] text-[13.5px] leading-relaxed transition-colors duration-200",
								selected
									? "text-text-sub-600 dark:text-white/55"
									: "text-text-soft-400 group-hover:text-text-sub-600 dark:text-white/30 dark:group-hover:text-white/50",
							)}
						>
							{tab.description}
						</p>
						<Link
							href={tab.href}
							{...(tab.href.startsWith("http")
								? { target: "_blank", rel: "noopener noreferrer" }
								: {})}
							onClick={(event) => event.stopPropagation()}
							className={cn(
								"mt-4 inline-flex items-center gap-1 text-[13.5px] transition-colors duration-200",
								selected
									? "text-primary-base font-medium"
									: "text-text-soft-400 group-hover:text-primary-base dark:text-white/30 dark:group-hover:text-primary-base",
							)}
						>
							Learn more
							<span
								aria-hidden
								className="transition-transform duration-200 group-hover:translate-x-0.5"
							>
								›
							</span>
						</Link>
					</div>
				);
			})}
		</div>
	);
}
