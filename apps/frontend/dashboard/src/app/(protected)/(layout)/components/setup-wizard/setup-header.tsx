"use client";

import NumberFlow from "@number-flow/react";
import { getGreeting } from "./use-setup-progress";

export function SetupHeader({
	firstName,
	stepsLeft,
}: {
	firstName: string;
	stepsLeft: number;
	completedCount: number;
}) {
	const greeting = getGreeting();
	const isComplete = stepsLeft === 0;

	return (
		<div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
			<div className="text-left">
				<h1 className="font-bold text-3xl text-text-strong-950 tracking-tight md:text-4xl dark:text-white">
					{greeting}, {firstName} 👋
				</h1>
				<p className="mt-2 max-w-xl text-base text-text-sub-600 dark:text-white/60">
					{isComplete ? (
						"You're all set! Start sending emails."
					) : (
						<>
							Let's get your account ready to send transactional emails —{" "}
							<NumberFlow value={stepsLeft} /> step
							{stepsLeft > 1 ? "s" : ""} remaining
						</>
					)}
				</p>
			</div>
			<div className="flex items-center gap-2 self-start lg:self-center">
				<span
					className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-semibold text-xs ${
						isComplete
							? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
							: "border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400"
					}`}
				>
					<span
						className={`h-1.5 w-1.5 rounded-full ${
							isComplete ? "bg-emerald-500" : "animate-pulse bg-amber-500"
						}`}
					/>
					{isComplete ? "Setup complete" : "Setup in progress"}
				</span>
			</div>
		</div>
	);
}
