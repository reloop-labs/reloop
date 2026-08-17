"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useState } from "react";

export function HeroTemplatesPreview() {
	const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

	return (
		<div className="flex h-full flex-col overflow-hidden bg-bg-white-0 text-left font-sans dark:bg-black">
			{/* Template Toolbar */}
			<div className="flex shrink-0 items-center justify-between border-stroke-soft-200 border-b px-4 py-2.5 sm:px-6 dark:border-white/10">
				<div className="flex items-center gap-2 sm:gap-3">
					<div className="flex size-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400">
						<Icon name="layout" className="size-4" />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<span className="font-semibold text-[13px] text-text-strong-950 dark:text-white">
								welcome_v2.tsx
							</span>
							<span className="rounded-full bg-purple-500/10 px-2 py-0.5 font-medium text-[10px] text-purple-600 dark:text-purple-400">
								React Email / MJML
							</span>
						</div>
						<p className="text-[11px] text-text-soft-400 dark:text-white/40">
							Variables: user.name, magic_link, org.name
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<div className="hidden items-center rounded-lg border border-stroke-soft-200 p-0.5 sm:flex dark:border-white/10">
						<button
							type="button"
							onClick={() => setViewMode("desktop")}
							className={cn(
								"rounded-md px-2 py-1 font-medium text-[11px] transition-colors",
								viewMode === "desktop"
									? "bg-text-strong-950 text-white dark:bg-white dark:text-black"
									: "text-text-sub-600 dark:text-white/50",
							)}
						>
							Desktop
						</button>
						<button
							type="button"
							onClick={() => setViewMode("mobile")}
							className={cn(
								"rounded-md px-2 py-1 font-medium text-[11px] transition-colors",
								viewMode === "mobile"
									? "bg-text-strong-950 text-white dark:bg-white dark:text-black"
									: "text-text-sub-600 dark:text-white/50",
							)}
						>
							Mobile
						</button>
					</div>
					<span className="inline-flex h-7.5 items-center rounded-lg bg-text-strong-950 px-3 font-medium text-[12px] text-white dark:bg-white dark:text-black">
						Publish
					</span>
				</div>
			</div>

			{/* Template Workspace Grid */}
			<div className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[240px_minmax(0,1fr)]">
				{/* Left: Dynamic Variables & Component Library */}
				<div className="hidden border-stroke-soft-200 border-r p-4 lg:block dark:border-white/10">
					<p className="font-semibold text-[10px] text-text-soft-400 uppercase tracking-wider dark:text-white/40">
						Template Variables
					</p>
					<div className="mt-2 space-y-1.5">
						<div className="rounded-lg border border-stroke-soft-200 bg-bg-weak-50/50 p-2 text-[11px] dark:border-white/10 dark:bg-white/[0.02]">
							<span className="font-mono text-purple-600 dark:text-purple-400">
								{"{{ user.name }}"}
							</span>
							<p className="text-[10px] text-text-soft-400">Maya Chen</p>
						</div>
						<div className="rounded-lg border border-stroke-soft-200 bg-bg-weak-50/50 p-2 text-[11px] dark:border-white/10 dark:bg-white/[0.02]">
							<span className="font-mono text-purple-600 dark:text-purple-400">
								{"{{ org.name }}"}
							</span>
							<p className="text-[10px] text-text-soft-400">Acme Labs</p>
						</div>
						<div className="rounded-lg border border-stroke-soft-200 bg-bg-weak-50/50 p-2 text-[11px] dark:border-white/10 dark:bg-white/[0.02]">
							<span className="font-mono text-purple-600 dark:text-purple-400">
								{"{{ cta.url }}"}
							</span>
							<p className="text-[10px] text-text-soft-400">https://app.reloop.sh</p>
						</div>
					</div>

					<p className="mt-5 font-semibold text-[10px] text-text-soft-400 uppercase tracking-wider dark:text-white/40">
						Components
					</p>
					<div className="mt-2 space-y-1 text-[11px]">
						<div className="flex items-center gap-2 rounded-md p-1.5 text-text-sub-600 dark:text-white/60">
							<span className="size-2 rounded-full bg-blue-500" /> Header with Logo
						</div>
						<div className="flex items-center gap-2 rounded-md p-1.5 text-text-sub-600 dark:text-white/60">
							<span className="size-2 rounded-full bg-purple-500" /> Dynamic Hero Button
						</div>
						<div className="flex items-center gap-2 rounded-md p-1.5 text-text-sub-600 dark:text-white/60">
							<span className="size-2 rounded-full bg-emerald-500" /> One-Click Footer
						</div>
					</div>
				</div>

				{/* Right: Live Rendered Email Canvas */}
				<div className="flex flex-1 items-center justify-center overflow-y-auto bg-bg-weak-50/30 p-4 sm:p-6 dark:bg-white/[0.01]">
					<div
						className={cn(
							"w-full rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-6 shadow-sm transition-all duration-300 dark:border-white/10 dark:bg-[#0c0c0d]",
							viewMode === "mobile" ? "max-w-[340px]" : "max-w-[480px]",
						)}
					>
						{/* Email Header */}
						<div className="flex items-center justify-between border-stroke-soft-200 border-b pb-4 dark:border-white/10">
							<div className="flex items-center gap-2">
								<div className="size-6 rounded-md bg-text-strong-950 text-center font-bold text-[11px] text-white leading-6 dark:bg-white dark:text-black">
									R
								</div>
								<span className="font-semibold text-[13px] text-text-strong-950 dark:text-white">
									Reloop
								</span>
							</div>
							<span className="text-[11px] text-text-soft-400 dark:text-white/40">
								Transactional
							</span>
						</div>

						{/* Email Body */}
						<div className="py-5">
							<h3 className="font-bold text-[18px] text-text-strong-950 leading-snug tracking-tight dark:text-white">
								Welcome to Reloop, Maya!
							</h3>
							<p className="mt-2 text-[13px] text-text-sub-600 leading-relaxed dark:text-white/60">
								Your team workspace at{" "}
								<span className="font-medium text-text-strong-950 dark:text-white">
									Acme Labs
								</span>{" "}
								is ready. Send, track, and automate high-deliverability emails
								with pure developer DX.
							</p>

							<div className="mt-5">
								<span className="inline-flex items-center justify-center rounded-xl bg-text-strong-950 px-5 py-2.5 font-semibold text-[12px] text-white shadow-xs dark:bg-white dark:text-black">
									Open Developer Console →
								</span>
							</div>
						</div>

						{/* Email Footer */}
						<div className="border-stroke-soft-200 border-t pt-4 text-[11px] text-text-soft-400 dark:border-white/10 dark:text-white/40">
							<p>Reloop Labs · 100% open-source email infrastructure</p>
							<p className="mt-1">Unsubscribe or manage notification settings</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
