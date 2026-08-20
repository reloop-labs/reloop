"use client";

import { Icon } from "@reloop/ui/icon";

export function HeroDashboardHeader() {
	return (
		<header className="flex h-11 shrink-0 items-center justify-between border-stroke-soft-200 border-b px-3 dark:border-white/10">
			<div className="flex items-center gap-1.5">
				<span className="hidden size-7 items-center justify-center rounded-lg text-text-soft-400 md:flex dark:text-white/35">
					<svg viewBox="0 0 16 16" className="size-3.5" fill="none">
						<rect
							x="2"
							y="2.5"
							width="12"
							height="11"
							rx="1.6"
							stroke="currentColor"
							strokeWidth="1.3"
						/>
						<path d="M6 2.5v11" stroke="currentColor" strokeWidth="1.3" />
					</svg>
				</span>
				<button
					type="button"
					className="flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-left transition-colors duration-150 hover:bg-bg-weak-50/80 dark:hover:bg-white/[0.06]"
				>
					<span className="flex size-5 items-center justify-center rounded-md bg-amber-100 font-medium text-[10px] text-amber-900 dark:bg-amber-400/20 dark:text-amber-200">
						A
					</span>
					<span className="font-medium text-[13px] text-text-strong-950 dark:text-white">
						Acme
					</span>
					<Icon
						name="chevron-down"
						className="size-3 text-text-soft-400 dark:text-white/35"
					/>
				</button>
			</div>
			<div className="flex items-center gap-1.5">
				<button
					type="button"
					className="hidden h-7 items-center rounded-lg px-2 text-[12px] text-text-sub-600 transition-colors duration-150 hover:bg-bg-weak-50 hover:text-text-strong-950 sm:inline-flex dark:text-white/50 dark:hover:bg-white/[0.04] dark:hover:text-white"
				>
					Copy prompt
				</button>
				<button
					type="button"
					className="hidden h-7 items-center gap-1 rounded-lg px-2 text-[12px] text-text-sub-600 transition-colors duration-150 hover:bg-bg-weak-50 hover:text-text-strong-950 sm:inline-flex dark:text-white/50 dark:hover:bg-white/[0.04] dark:hover:text-white"
				>
					<Icon name="question" className="size-3.5" />
					Support
				</button>
				<button
					type="button"
					className="flex size-6 items-center justify-center rounded-full bg-emerald-100 font-medium text-[10px] text-emerald-900 transition-transform duration-150 hover:scale-105 hover:ring-2 hover:ring-emerald-500/20 dark:bg-emerald-400/20 dark:text-emerald-200"
				>
					P
				</button>
			</div>
		</header>
	);
}
