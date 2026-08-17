"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { useState } from "react";

export function HeroWorkflowPreview() {
	const [simulating, setSimulating] = useState(false);
	const [activeStep, setActiveStep] = useState<number>(0);

	const runSimulation = () => {
		if (simulating) return;
		setSimulating(true);
		setActiveStep(1);

		setTimeout(() => setActiveStep(2), 700);
		setTimeout(() => setActiveStep(3), 1500);
		setTimeout(() => {
			setActiveStep(4);
			setSimulating(false);
		}, 2400);
	};

	return (
		<div className="flex h-full flex-col overflow-hidden bg-bg-white-0 text-left font-sans dark:bg-black">
			{/* Workflow Top Toolbar */}
			<div className="flex shrink-0 items-center justify-between border-stroke-soft-200 border-b px-4 py-2.5 sm:px-6 dark:border-white/10">
				<div className="flex items-center gap-2 sm:gap-3">
					<div className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
						<Icon name="workflow" className="size-4" />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<span className="font-semibold text-[13px] text-text-strong-950 dark:text-white">
								user_onboarding.flow
							</span>
							<span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-medium text-[10px] text-emerald-600 dark:text-emerald-400">
								Active
							</span>
						</div>
						<p className="text-[11px] text-text-soft-400 dark:text-white/40">
							Triggered by auth.signup · 14,280 runs this week
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={runSimulation}
						disabled={simulating}
						className="inline-flex h-7.5 items-center gap-1.5 rounded-lg bg-text-strong-950 px-3 font-medium text-[12px] text-white transition-opacity hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
					>
						<span
							className={cn(
								"size-1.5 rounded-full bg-emerald-400",
								simulating && "animate-pulse",
							)}
						/>
						{simulating ? "Executing..." : "Test Flow"}
					</button>
				</div>
			</div>

			{/* Canvas Flow Area */}
			<div className="relative flex-1 overflow-y-auto p-4 sm:p-6">
				{/* Background Dot/Grid pattern */}
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 bg-[radial-gradient(#00000010_1px,transparent_1px)] bg-[size:16px_16px] dark:bg-[radial-gradient(#ffffff10_1px,transparent_1px)]"
				/>

				<div className="relative mx-auto flex max-w-xl flex-col items-center gap-3">
					{/* Step 1: Trigger */}
					<div
						className={cn(
							"w-full rounded-xl border bg-bg-white-0 p-3.5 shadow-xs transition-all duration-300 dark:bg-[#111]",
							activeStep >= 1
								? "border-blue-500 shadow-blue-500/10 ring-2 ring-blue-500/20"
								: "border-stroke-soft-200 dark:border-white/10",
						)}
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2.5">
								<span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
									<Icon name="webhook" className="size-3.5" />
								</span>
								<div>
									<p className="font-semibold text-[13px] text-text-strong-950 dark:text-white">
										1. Event Trigger
									</p>
									<p className="text-[11px] text-text-sub-600 dark:text-white/50">
										Webhook: <code className="font-mono">auth.signup</code>
									</p>
								</div>
							</div>
							<span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
								✓ Realtime
							</span>
						</div>
					</div>

					{/* Connector */}
					<div className="h-4 w-px bg-stroke-soft-200 dark:bg-white/15" />

					{/* Step 2: Send Welcome Email */}
					<div
						className={cn(
							"w-full rounded-xl border bg-bg-white-0 p-3.5 shadow-xs transition-all duration-300 dark:bg-[#111]",
							activeStep >= 2
								? "border-blue-500 shadow-blue-500/10 ring-2 ring-blue-500/20"
								: "border-stroke-soft-200 dark:border-white/10",
						)}
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2.5">
								<span className="flex size-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
									<Icon name="mail-single" className="size-3.5" />
								</span>
								<div>
									<p className="font-semibold text-[13px] text-text-strong-950 dark:text-white">
										2. Send Email
									</p>
									<p className="text-[11px] text-text-sub-600 dark:text-white/50">
										Template: <code className="font-mono">welcome_onboarding</code>{" "}
										(Instant)
									</p>
								</div>
							</div>
							<span className="rounded-md bg-bg-weak-50 px-2 py-0.5 text-[11px] text-text-sub-600 dark:bg-white/10 dark:text-white/60">
								99.6% delivered
							</span>
						</div>
					</div>

					{/* Connector */}
					<div className="h-4 w-px bg-stroke-soft-200 dark:bg-white/15" />

					{/* Step 3: Condition Branch */}
					<div
						className={cn(
							"w-full rounded-xl border bg-bg-white-0 p-3.5 shadow-xs transition-all duration-300 dark:bg-[#111]",
							activeStep >= 3
								? "border-amber-500 shadow-amber-500/10 ring-2 ring-amber-500/20"
								: "border-stroke-soft-200 dark:border-white/10",
						)}
					>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2.5">
								<span className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
									<Icon name="workflow" className="size-3.5" />
								</span>
								<div>
									<p className="font-semibold text-[13px] text-text-strong-950 dark:text-white">
										3. Check Engagement
									</p>
									<p className="text-[11px] text-text-sub-600 dark:text-white/50">
										Condition: <code className="font-mono">email.clicked === true</code>{" "}
										within 24h
									</p>
								</div>
							</div>
							<span className="font-medium text-[11px] text-amber-600 dark:text-amber-400">
								Branch (2 paths)
							</span>
						</div>
					</div>

					{/* Branches Grid */}
					<div className="grid w-full grid-cols-2 gap-3 pt-1">
						{/* Branch Yes */}
						<div
							className={cn(
								"rounded-xl border bg-bg-white-0 p-3 shadow-xs transition-all duration-300 dark:bg-[#111]",
								activeStep >= 4
									? "border-emerald-500/60 bg-emerald-50/20 dark:bg-emerald-950/10"
									: "border-stroke-soft-200 dark:border-white/10",
							)}
						>
							<div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
								<span className="size-1.5 rounded-full bg-current" />
								<span className="font-semibold text-[11px] uppercase tracking-wider">
									Yes (68%)
								</span>
							</div>
							<p className="mt-1 font-medium text-[12px] text-text-strong-950 dark:text-white">
								Send Product Tour
							</p>
							<p className="text-[10px] text-text-soft-400 dark:text-white/40">
								Tag: <code className="font-mono">engaged_user</code>
							</p>
						</div>

						{/* Branch No */}
						<div className="rounded-xl border border-stroke-soft-200 bg-bg-white-0 p-3 shadow-xs dark:border-white/10 dark:bg-[#111]">
							<div className="flex items-center gap-1.5 text-text-soft-400 dark:text-white/40">
								<span className="size-1.5 rounded-full bg-current" />
								<span className="font-semibold text-[11px] uppercase tracking-wider">
									No (32%)
								</span>
							</div>
							<p className="mt-1 font-medium text-[12px] text-text-strong-950 dark:text-white">
								Send Nudge Email
							</p>
							<p className="text-[10px] text-text-soft-400 dark:text-white/40">
								Delay: 48 hours
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
