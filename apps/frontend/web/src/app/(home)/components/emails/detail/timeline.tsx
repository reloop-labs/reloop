"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";

export interface TimelineStepData {
	id: "sent" | "delivered" | "opened" | "clicked" | "failed";
	label: string;
	icon: string;
	timestamp?: string;
}

const DEFAULT_TIMELINE_STEPS: TimelineStepData[] = [
	{
		id: "sent",
		label: "Sent",
		icon: "send-1",
		timestamp: "17 Aug, 6:24pm",
	},
	{
		id: "delivered",
		label: "Delivered",
		icon: "check-circle",
		timestamp: "17 Aug, 6:24pm",
	},
	{
		id: "opened",
		label: "Opened",
		icon: "eye-outline",
		timestamp: "17 Aug, 6:25pm",
	},
	{
		id: "clicked",
		label: "Clicked",
		icon: "cursor-click",
		timestamp: "17 Aug, 6:25pm",
	},
];

export function EmailTimeline({ status = "opened" }: { status?: string }) {
	const currentStepIndex = (() => {
		switch (status.toLowerCase()) {
			case "clicked":
				return 3;
			case "opened":
				return 2;
			case "delivered":
				return 1;
			case "sent":
			default:
				return 0;
		}
	})();

	return (
		<div className="relative flex h-[176px] w-full items-center justify-start rounded-3xl border border-stroke-soft-100 bg-bg-white-0 px-8 pt-6 pb-5 transition-all hover:border-stroke-soft-200 dark:border-stroke-soft-100/50 dark:bg-bg-white-0/5">
			<div className="flex w-full max-w-2xl items-start justify-between">
				{DEFAULT_TIMELINE_STEPS.map((step, idx) => {
					const isCompleted = idx <= currentStepIndex;
					const hasNext = idx < DEFAULT_TIMELINE_STEPS.length - 1;
					const nextIsCompleted = idx + 1 <= currentStepIndex;

					const getIconStyles = () => {
						if (!isCompleted) {
							return "border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600 dark:border-stroke-soft-100/40 dark:bg-neutral-900";
						}
						switch (step.id) {
							case "sent":
								return "border-information-base/20 bg-information-lighter/50 text-information-base dark:bg-information-lighter/20";
							case "delivered":
								return "border-success-base/20 bg-success-lighter/50 text-success-base dark:bg-success-lighter/20";
							case "opened":
								return "border-orange-500/20 bg-orange-50/50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400";
							case "clicked":
								return "border-purple-500/20 bg-purple-50/50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400";
							default:
								return "border-information-base/20 bg-information-lighter/50 text-information-base";
						}
					};

					const getBadgeStyles = () => {
						if (!isCompleted) {
							return "bg-bg-weak-50 text-text-sub-600 dark:bg-neutral-900";
						}
						switch (step.id) {
							case "sent":
								return "bg-information-lighter text-information-base dark:bg-information-lighter/20";
							case "delivered":
								return "bg-success-lighter text-success-base dark:bg-success-lighter/20";
							case "opened":
								return "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400";
							case "clicked":
								return "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400";
							default:
								return "bg-information-lighter text-information-base";
						}
					};

					return (
						<div
							key={step.id}
							className="relative flex flex-1 flex-col items-center last:flex-none"
						>
							{/* Connecting Flow Edge */}
							{hasNext && (
								<div className="-z-0 -translate-y-1/2 absolute top-5 left-1/2 h-[1.5px] w-full bg-stroke-soft-200 dark:bg-stroke-soft-100/40">
									<div
										className={cn(
											"h-full transition-all duration-300",
											nextIsCompleted ? "bg-primary-base" : "bg-transparent",
										)}
									/>
								</div>
							)}

							{/* Icon Node */}
							<div className="relative z-10 flex flex-col items-center gap-2">
								<div
									className={cn(
										"flex h-10 w-10 items-center justify-center rounded-[10px] border transition-all duration-300",
										getIconStyles(),
									)}
								>
									<Icon name={step.icon} className="h-5 w-5" />
								</div>

								<div className="flex flex-col items-center text-center">
									<span
										className={cn(
											"rounded-md px-2 py-1 font-semibold text-xs transition-colors duration-300",
											getBadgeStyles(),
										)}
									>
										{step.label}
									</span>
									{isCompleted && step.timestamp && (
										<span className="mt-1 font-mono text-[11px] text-text-sub-600">
											{step.timestamp}
										</span>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
