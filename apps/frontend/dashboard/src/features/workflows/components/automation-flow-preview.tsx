"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { nodeTone } from "../node-tone";

interface AutomationFlowPreviewProps {
	variant?: "workflows" | "events";
	className?: string;
}

export function AutomationFlowPreview({
	variant = "workflows",
	className,
}: AutomationFlowPreviewProps) {
	if (variant === "events") {
		return (
			<aside className={cn("space-y-4", className)}>
				{/* Event Flowchart */}
				<div className="space-y-0">
					{/* App event card */}
					<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-xs dark:border-stroke-soft-100/60 dark:bg-bg-white-0/5">
						<div className="flex items-center justify-between">
							<span className="font-mono text-[9px] text-text-soft-400 uppercase tracking-widest">
								Incoming Event
							</span>
							<span className="font-mono text-[10px] text-text-sub-600">
								API / SDK
							</span>
						</div>
						<div className="mt-1.5 flex items-center gap-2.5">
							<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300">
								<Icon name="route" className="h-3.5 w-3.5" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="truncate font-mono font-semibold text-text-strong-950 text-xs">
									auth.signup
								</p>
								<p className="truncate font-mono text-[10px] text-text-sub-600">
									{"{ email, name, plan }"}
								</p>
							</div>
						</div>
					</div>

					{/* Connector */}
					<div className="my-1.5 flex flex-col items-center">
						<div className="h-3 w-px bg-stroke-soft-200 dark:bg-stroke-soft-100/60" />
						<div className="flex items-center gap-1 rounded-full border border-stroke-soft-200 bg-bg-white-0 px-2 py-0.5 font-mono text-[10px] text-text-sub-600 shadow-2xs dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/60">
							<span>triggers</span>
						</div>
						<div className="h-3 w-px bg-stroke-soft-200 dark:bg-stroke-soft-100/60" />
					</div>

					{/* Matched Workflow Card */}
					<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-xs dark:border-stroke-soft-100/60 dark:bg-bg-white-0/5">
						<div className="flex items-center justify-between">
							<span className="font-mono text-[9px] text-text-soft-400 uppercase tracking-widest">
								Automation
							</span>
							<span className="inline-flex items-center gap-1 font-medium text-[10px] text-emerald-600 dark:text-emerald-400">
								<span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
								Active
							</span>
						</div>
						<div className="mt-1.5 flex items-center gap-2.5">
							<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
								<Icon name="workflow" className="h-3.5 w-3.5" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="truncate font-semibold text-text-strong-950 text-xs">
									Welcome to Reloop
								</p>
								<p className="truncate text-[10px] text-text-sub-600">
									3 emails · 2 delays · 1 condition
								</p>
							</div>
						</div>
					</div>
				</div>
			</aside>
		);
	}

	return (
		<aside className={cn("space-y-4", className)}>
			{/* Flowchart Sequence */}
			<div className="space-y-0">
				{/* 1. TRIGGER NODE */}
				<div className="group relative">
					<div className="relative overflow-visible rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-xs transition-shadow hover:shadow-sm dark:border-stroke-soft-100/60 dark:bg-bg-white-0/5">
						<div className="flex items-center gap-2.5">
							<div
								className={cn(
									"flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
									nodeTone.trigger.well,
								)}
							>
								<Icon name={nodeTone.trigger.icon} className="h-4 w-4" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="font-mono text-[9px] text-text-soft-400 uppercase tracking-widest">
									Trigger
								</p>
								<p className="truncate font-semibold text-[13px] text-text-strong-950 leading-tight">
									User signed up
								</p>
								<p className="mt-0.5 truncate font-mono text-[10px] text-text-sub-600">
									event: auth.signup
								</p>
							</div>
						</div>
					</div>
					{/* Bottom handle dot */}
					<div className="absolute -bottom-1 left-1/2 z-10 h-2 w-2 -translate-x-1/2 rounded-full border border-bg-white-0 bg-stroke-sub-300 dark:border-bg-black-950" />
				</div>

				{/* Connector 1 */}
				<div className="flex justify-center">
					<div className="h-4 w-px bg-stroke-soft-200 dark:bg-stroke-soft-100/60" />
				</div>

				{/* 2. SEND EMAIL NODE */}
				<div className="group relative">
					{/* Top handle dot */}
					<div className="absolute -top-1 left-1/2 z-10 h-2 w-2 -translate-x-1/2 rounded-full border border-bg-white-0 bg-stroke-sub-300 dark:border-bg-black-950" />
					<div className="relative overflow-visible rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-xs transition-shadow hover:shadow-sm dark:border-stroke-soft-100/60 dark:bg-bg-white-0/5">
						<div className="flex items-center gap-2.5">
							<div
								className={cn(
									"flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
									nodeTone.send_email.well,
								)}
							>
								<Icon name={nodeTone.send_email.icon} className="h-4 w-4" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="font-mono text-[9px] text-text-soft-400 uppercase tracking-widest">
									Send Email
								</p>
								<p className="truncate font-semibold text-[13px] text-text-strong-950 leading-tight">
									Welcome to Reloop
								</p>
								<p className="mt-0.5 truncate font-mono text-[10px] text-text-sub-600">
									Template: Welcome onboard 👋
								</p>
							</div>
						</div>
					</div>
					{/* Bottom handle dot */}
					<div className="absolute -bottom-1 left-1/2 z-10 h-2 w-2 -translate-x-1/2 rounded-full border border-bg-white-0 bg-stroke-sub-300 dark:border-bg-black-950" />
				</div>

				{/* Connector 2 */}
				<div className="flex justify-center">
					<div className="h-4 w-px bg-stroke-soft-200 dark:bg-stroke-soft-100/60" />
				</div>

				{/* 3. DELAY NODE */}
				<div className="group relative">
					{/* Top handle dot */}
					<div className="absolute -top-1 left-1/2 z-10 h-2 w-2 -translate-x-1/2 rounded-full border border-bg-white-0 bg-stroke-sub-300 dark:border-bg-black-950" />
					<div className="relative overflow-visible rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-xs transition-shadow hover:shadow-sm dark:border-stroke-soft-100/60 dark:bg-bg-white-0/5">
						<div className="flex items-center gap-2.5">
							<div
								className={cn(
									"flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
									nodeTone.delay.well,
								)}
							>
								<Icon name={nodeTone.delay.icon} className="h-4 w-4" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="font-mono text-[9px] text-text-soft-400 uppercase tracking-widest">
									Delay
								</p>
								<p className="truncate font-semibold text-[13px] text-text-strong-950 leading-tight">
									Wait 2 days
								</p>
								<p className="mt-0.5 truncate font-mono text-[10px] text-text-sub-600">
									Duration: 48 hours
								</p>
							</div>
						</div>
					</div>
					{/* Bottom handle dot */}
					<div className="absolute -bottom-1 left-1/2 z-10 h-2 w-2 -translate-x-1/2 rounded-full border border-bg-white-0 bg-stroke-sub-300 dark:border-bg-black-950" />
				</div>

				{/* Connector 3 */}
				<div className="flex justify-center">
					<div className="h-4 w-px bg-stroke-soft-200 dark:bg-stroke-soft-100/60" />
				</div>

				{/* 4. CONDITION NODE (BRANCHING) */}
				<div className="group relative">
					{/* Top handle dot */}
					<div className="absolute -top-1 left-1/2 z-10 h-2 w-2 -translate-x-1/2 rounded-full border border-bg-white-0 bg-stroke-sub-300 dark:border-bg-black-950" />
					<div className="relative overflow-visible rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-xs dark:border-stroke-soft-100/60 dark:bg-bg-white-0/5">
						<div className="flex items-center gap-2.5">
							<div
								className={cn(
									"flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
									nodeTone.condition.well,
								)}
							>
								<Icon name={nodeTone.condition.icon} className="h-4 w-4" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="font-mono text-[9px] text-text-soft-400 uppercase tracking-widest">
									Condition
								</p>
								<p className="truncate font-semibold text-[13px] text-text-strong-950 leading-tight">
									Sent first email?
								</p>
								<p className="mt-0.5 truncate font-mono text-[10px] text-text-sub-600">
									campaigns &gt; 0
								</p>
							</div>
						</div>
					</div>

					{/* Dual Branch Output */}
					<div className="mt-2.5 grid grid-cols-2 gap-2 border-stroke-soft-200 border-t border-dashed pt-1 dark:border-stroke-soft-100/40">
						{/* Branch Yes */}
						<div className="flex flex-col items-center">
							<span className="mb-1 inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 font-medium text-[9.5px] text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
								Yes
							</span>
							<div className="w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2 shadow-2xs dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5">
								<div className="flex items-center gap-1.5">
									<div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
										<Icon name="mail-single" className="h-3 w-3" />
									</div>
									<p className="truncate font-medium text-[11px] text-text-strong-950">
										Pro Tips
									</p>
								</div>
							</div>
						</div>

						{/* Branch No */}
						<div className="flex flex-col items-center">
							<span className="mb-1 inline-flex items-center rounded-md bg-neutral-alpha-10 px-1.5 py-0.5 font-medium text-[9.5px] text-text-sub-600">
								No
							</span>
							<div className="w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 p-2 shadow-2xs dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5">
								<div className="flex items-center gap-1.5">
									<div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300">
										<Icon name="mail-single" className="h-3 w-3" />
									</div>
									<p className="truncate font-medium text-[11px] text-text-strong-950">
										Need Help?
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</aside>
	);
}
