"use client";

import { AnimatePresence, motion } from "framer-motion";
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

function VerdictPill({ verdict }: { verdict: TestedEmailRecord["verdict"] }) {
	switch (verdict) {
		case "disposable":
			return (
				<span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/[0.08] px-2.5 py-0.5 font-mono text-[11px] font-medium text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-400">
					<span className="size-1.5 rounded-full bg-rose-500" />
					Disposable
				</span>
			);
		case "deliverable":
			return (
				<span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-2.5 py-0.5 font-mono text-[11px] font-medium text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400">
					<span className="size-1.5 rounded-full bg-emerald-500" />
					Deliverable
				</span>
			);
		case "risky":
			return (
				<span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/[0.08] px-2.5 py-0.5 font-mono text-[11px] font-medium text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400">
					<span className="size-1.5 rounded-full bg-amber-500" />
					Shared Role
				</span>
			);
		default:
			return (
				<span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-500/20 bg-neutral-500/[0.08] px-2.5 py-0.5 font-mono text-[11px] font-medium text-neutral-600 dark:border-white/20 dark:bg-white/10 dark:text-white/70">
					<span className="size-1.5 rounded-full bg-neutral-400" />
					Invalid
				</span>
			);
	}
}

export function RecentChecksSection() {
	const { list } = useTestedEmails();

	return (
		<section id="recent-checks-section" className="w-full">
			{/* Section Header: Centered title without bottom divider */}
			<div className="px-4 pt-10 pb-6 text-center sm:px-8 sm:pt-14 sm:pb-8 lg:px-12">
				<h2 className="mx-auto font-semibold text-3xl text-text-strong-950 tracking-tight sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12] dark:text-white">
					Recently tested emails
				</h2>
			</div>

			{/* Contained Card */}
			{list.length > 0 && (
				<div className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 md:px-8 sm:pb-16">
					<div className="overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 dark:border-white/10 dark:bg-[#070707]">
						<div className="divide-y divide-stroke-soft-200 dark:divide-white/10">
							<AnimatePresence initial={false}>
								{list.map((item) => (
									<motion.div
										key={item.id}
										initial={{ opacity: 0, y: -4 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, height: 0 }}
										transition={{ duration: 0.15 }}
										className="flex flex-col gap-1 px-5 py-4 transition-colors hover:bg-bg-weak-50/50 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:hover:bg-white/[0.02]"
									>
										{/* Left: Email & Verdict */}
										<div className="flex flex-wrap items-center gap-2.5">
											<span className="font-mono text-[13.5px] font-semibold text-text-strong-950 tracking-tight sm:text-[14px] dark:text-white">
												{item.email}
											</span>
											<VerdictPill verdict={item.verdict} />
										</div>

										{/* Right: Timestamp */}
										<div className="flex items-center font-mono text-[11.5px] text-text-soft-400 sm:shrink-0 dark:text-white/40">
											{formatRelativeTime(item.timestamp)}
										</div>
									</motion.div>
								))}
							</AnimatePresence>
						</div>
					</div>
				</div>
			)}
		</section>
	);
}
