"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { MARKETING_TABS, type MarketingTabId } from "./preview-scenes";

export function PreviewTabs({
	active,
	onChange,
}: {
	active: MarketingTabId;
	onChange: (id: MarketingTabId) => void;
}) {
	const shouldReduceMotion = useReducedMotion();

	return (
		<div
			role="tablist"
			aria-label="Marketing email features"
			className="grid border-stroke-soft-200 border-t bg-bg-white-0 sm:grid-cols-3 dark:border-white/10 dark:bg-black"
		>
			{MARKETING_TABS.map((tab) => {
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
									shouldReduceMotion ? undefined : "marketing-tab-indicator"
								}
								className="absolute right-0 bottom-0 left-0 z-10 h-0.5 bg-text-strong-950 dark:bg-white"
								transition={
									shouldReduceMotion
										? { duration: 0 }
										: { type: "spring", bounce: 0, duration: 0.28 }
								}
							/>
						)}
						<Icon
							name={tab.icon}
							className={cn(
								"size-4 transition-colors duration-200",
								selected
									? "text-text-strong-950 dark:text-white"
									: "text-text-soft-400 group-hover:text-text-sub-600 dark:text-white/40 dark:group-hover:text-white/70",
							)}
						/>
						<span
							className={cn(
								"mt-3 block font-semibold text-sm transition-colors duration-200",
								selected
									? "text-text-strong-950 dark:text-white"
									: "text-text-sub-600 group-hover:text-text-strong-950 dark:text-white/70 dark:group-hover:text-white",
							)}
						>
							{tab.title}
						</span>
						<p className="mt-1.5 text-text-sub-600 text-xs leading-relaxed dark:text-white/60">
							{tab.description}
						</p>
						<span className="mt-4 inline-flex items-center gap-1 font-medium text-text-soft-400 text-xs transition-colors duration-200 group-hover:text-text-strong-950 dark:text-white/40 dark:group-hover:text-white">
							<Link
								href={tab.href}
								onClick={(e) => e.stopPropagation()}
								className="inline-flex items-center gap-1 hover:underline"
							>
								Learn more
								<span
									aria-hidden="true"
									className="inline-block transition-transform duration-200 group-hover:translate-x-0.5"
								>
									→
								</span>
							</Link>
						</span>
					</div>
				);
			})}
		</div>
	);
}
