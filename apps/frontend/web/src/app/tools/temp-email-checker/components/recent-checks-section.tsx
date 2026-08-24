"use client";

import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
	type TestedEmailRecord,
	useTestedEmails,
} from "../tested-emails-store";

function formatRelativeTime(timestamp: number): string {
	const seconds = Math.floor((Date.now() - timestamp) / 1000);
	if (seconds < 60) return "Just now";
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	return `${days}d ago`;
}

function getVerdictConfig(verdict: TestedEmailRecord["verdict"]) {
	switch (verdict) {
		case "disposable":
			return {
				label: "Disposable",
				dotColor: "bg-rose-500",
				badgeStyles:
					"border-rose-500/20 bg-rose-500/[0.08] text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-400",
			};
		case "deliverable":
			return {
				label: "Deliverable",
				dotColor: "bg-emerald-500",
				badgeStyles:
					"border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400",
			};
		case "risky":
			return {
				label: "Shared Role",
				dotColor: "bg-amber-500",
				badgeStyles:
					"border-amber-500/20 bg-amber-500/[0.08] text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400",
			};
		default:
			return {
				label: "Invalid",
				dotColor: "bg-neutral-400",
				badgeStyles:
					"border-stroke-soft-200 bg-bg-white-0 text-text-sub-600 dark:border-white/10 dark:bg-[#0b0b0b] dark:text-white/70",
			};
	}
}

export function RecentChecksSection() {
	const { list } = useTestedEmails();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	const displayedList = list.slice(0, 10);

	if (displayedList.length === 0) return null;

	return (
		<section
			id="recent-checks-section"
			className="relative z-10 w-full px-5 pb-16 sm:px-6 sm:pb-20 md:px-8 lg:pb-24"
		>
			{/* Contained Card Matching Signals & Detection / CheckerPanel */}
			<div className="mx-auto w-full max-w-xl">
				<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-weak-50 p-0.5 dark:border-white/10 dark:bg-white/[0.03]">
					<div className="px-3 pt-2 pb-2.5 sm:px-4 sm:pt-2.5">
						<p className="font-mono font-semibold text-[11px] text-text-strong-950 uppercase tracking-wider dark:text-white">
							Recent Checks
						</p>
					</div>

					<div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-4 py-1 divide-y divide-stroke-soft-200/50 dark:border-white/10 dark:bg-[#070707] dark:divide-white/5">
						<AnimatePresence initial={false}>
							{displayedList.map((item) => {
								const config = getVerdictConfig(item.verdict);
								return (
									<motion.div
										key={item.id}
										initial={{ opacity: 0, y: -4 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, height: 0 }}
										transition={{ duration: 0.15 }}
										className="flex items-center justify-between py-2.5 transition-colors hover:bg-bg-weak-50/50 dark:hover:bg-white/[0.02]"
									>
										{/* Left: Colored Dot + Email */}
										<div className="flex min-w-0 items-center gap-2.5 pr-3">
											<span
												className={cn(
													"size-2 shrink-0 rounded-full",
													config.dotColor,
												)}
											/>
											<span className="truncate font-medium text-text-strong-950 text-xs sm:text-[13px] dark:text-white">
												{item.email}
											</span>
										</div>

										{/* Right: Timestamp & Status Badge */}
										<div className="flex shrink-0 items-center gap-3">
											<span className="hidden font-mono text-[11px] text-text-soft-400 sm:inline-block dark:text-white/40">
												{formatRelativeTime(item.timestamp)}
											</span>
											<code
												className={cn(
													"rounded-md border px-2 py-0.5 font-medium font-mono text-[11px] tracking-tight",
													config.badgeStyles,
												)}
											>
												{config.label}
											</code>
										</div>
									</motion.div>
								);
							})}
						</AnimatePresence>
					</div>
				</div>
			</div>
		</section>
	);
}
