"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { motion, useReducedMotion } from "framer-motion";
import { Fragment, useEffect, useRef, useState } from "react";
import { PAGE_EASE } from "../../domain/_shared/page-motion";

const SUCCESS_STEPS = [
	{ id: "sent", label: "Sent", icon: "send-1" },
	{ id: "delivered", label: "Delivered", icon: "check-circle" },
	{ id: "opened", label: "Opened", icon: "eye-outline" },
	{ id: "clicked", label: "Clicked", icon: "cursor-click" },
] as const;

const FAILED_STEPS = [
	{ id: "sent", label: "Sent", icon: "send-1" },
	{ id: "failed", label: "Failed", icon: "cross-circle" },
] as const;

const BOUNCED_STEPS = [
	{ id: "sent", label: "Sent", icon: "send-1" },
	{ id: "bounced", label: "Bounced", icon: "cross-circle" },
] as const;

const COMPLETED_AT: Record<string, string> = {
	sent: "17 Aug, 6:24pm",
	delivered: "17 Aug, 6:24pm",
	opened: "17 Aug, 6:25pm",
	clicked: "17 Aug, 6:25pm",
	failed: "17 Aug, 6:24pm",
	bounced: "17 Aug, 6:24pm",
};

function completedThrough(status: string): number {
	switch (status.toLowerCase()) {
		case "clicked":
			return 3;
		case "opened":
			return 2;
		case "delivered":
			return 1;
		case "sent":
			return 0;
		default:
			return 0;
	}
}

const STEP_STAGGER = 0.09;
const LIGHT_BASE_MS = 280;
const LIGHT_STAGGER_MS = 220;
const DELIVERED_STEP = 1;

function startingLit(target: number, reduceMotion: boolean | null): number {
	if (reduceMotion) return target;
	// Keep Sent + Delivered locked and only play later steps (Opened & Clicked).
	if (target >= DELIVERED_STEP) return DELIVERED_STEP;
	return -1;
}

export function EmailTimeline({
	status = "opened",
	mounted = true,
	compact = false,
}: {
	status?: string;
	mounted?: boolean;
	compact?: boolean;
}) {
	const reduceMotion = useReducedMotion();
	const normalized = status.toLowerCase();
	const isBounced = normalized === "bounced";
	const isFailed =
		normalized === "failed" ||
		normalized === "bounced" ||
		normalized === "spam";
	const steps = isBounced
		? BOUNCED_STEPS
		: isFailed
			? FAILED_STEPS
			: SUCCESS_STEPS;
	const currentStepIndex = isFailed ? 1 : completedThrough(normalized);
	const [litThrough, setLitThrough] = useState(() =>
		startingLit(currentStepIndex, reduceMotion),
	);
	const litRef = useRef(startingLit(currentStepIndex, reduceMotion));

	useEffect(() => {
		const lockForward = (index: number) => {
			if (index < litRef.current) return;
			litRef.current = index;
			setLitThrough(index);
		};

		if (reduceMotion) {
			lockForward(currentStepIndex);
			return;
		}

		if (!mounted) return;

		const start = litRef.current + 1;
		if (start > currentStepIndex) return;

		const timers: number[] = [];
		for (let i = start; i <= currentStepIndex; i++) {
			const offset = i - start;
			timers.push(
				window.setTimeout(
					() => {
						lockForward(i);
					},
					(litRef.current < 0 ? LIGHT_BASE_MS : LIGHT_STAGGER_MS) +
						offset * LIGHT_STAGGER_MS,
				),
			);
		}

		return () => {
			for (const id of timers) window.clearTimeout(id);
		};
	}, [currentStepIndex, mounted, reduceMotion]);

	return (
		<div
			className={cn(
				"relative flex w-full items-center justify-start overflow-x-auto border border-stroke-soft-100 bg-bg-white-0 transition-all hover:border-stroke-soft-200 dark:border-stroke-soft-100/50 dark:bg-bg-white-0/5",
				compact
					? "h-[96px] rounded-xl px-5 pt-2 pb-1.5"
					: "h-[176px] rounded-3xl px-8 pt-6 pb-5",
			)}
		>
			<div
				className={cn(
					"flex items-start",
					isFailed
						? "w-full max-w-sm justify-between"
						: "w-full min-w-[480px] max-w-2xl justify-between",
				)}
			>
				{steps.map((step, index) => {
					const isCompleted = index <= litThrough;
					const timestamp = isCompleted
						? (COMPLETED_AT[step.id] ?? COMPLETED_AT.sent)
						: undefined;

					const getIconStyles = () => {
						if (!isCompleted) {
							return "border-stroke-soft-200 bg-bg-weak-50 text-text-sub-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400";
						}
						switch (step.id) {
							case "sent":
								return "border-information-base/20 bg-information-lighter/50 text-information-base";
							case "bounced":
							case "failed":
								return "border-error-light bg-error-lighter text-error-base";
							case "delivered":
								return "border-success-base/20 bg-success-lighter/50 text-success-base";
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
							return "bg-bg-weak-50 text-text-sub-600 dark:bg-neutral-900 dark:text-neutral-400";
						}
						switch (step.id) {
							case "sent":
								return "bg-information-lighter text-information-base";
							case "bounced":
							case "failed":
								return "bg-error-lighter text-error-base";
							case "delivered":
								return "bg-success-lighter text-success-base";
							case "opened":
								return "bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400";
							case "clicked":
								return "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400";
							default:
								return "bg-information-lighter text-information-base";
						}
					};

					const nodeBody = (
						<motion.div
							className={cn(
								"flex flex-col items-center",
								compact ? "gap-1" : "gap-2",
							)}
							initial={
								reduceMotion
									? false
									: { opacity: 0, y: 10, scale: 0.96, filter: "blur(3px)" }
							}
							animate={
								mounted
									? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
									: { opacity: 0, y: 10, scale: 0.96, filter: "blur(3px)" }
							}
							transition={{
								duration: 0.52,
								delay: 0.08 + index * STEP_STAGGER,
								ease: PAGE_EASE,
							}}
							style={{ willChange: "transform, opacity, filter" }}
						>
							<div
								className={cn(
									"flex shrink-0 items-center justify-center border transition-all duration-300",
									compact ? "size-7 rounded-md" : "size-10 rounded-[10px]",
									getIconStyles(),
								)}
							>
								<Icon
									name={step.icon}
									className={compact ? "size-3.5" : "size-5"}
								/>
							</div>

							<div className="flex flex-col items-center gap-0.5 text-center">
								<span
									className={cn(
										"font-semibold transition-colors duration-300",
										compact
											? "rounded px-1 py-0 text-[10px]"
											: "rounded-md px-2 py-1 text-xs",
										getBadgeStyles(),
									)}
								>
									{step.label}
								</span>
								<div
									className={cn(
										"flex items-center justify-center",
										compact ? "h-3" : "h-4",
									)}
								>
									{isCompleted && timestamp ? (
										<motion.span
											key={timestamp}
											initial={
												reduceMotion
													? false
													: { opacity: 0, y: 4, filter: "blur(2px)" }
											}
											animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
											transition={{ duration: 0.32, ease: PAGE_EASE }}
											className={cn(
												"whitespace-nowrap font-medium text-text-soft-400",
												compact ? "text-[9.5px]" : "text-xs",
											)}
										>
											{timestamp}
										</motion.span>
									) : (
										<span
											className={cn(
												"opacity-0",
												compact ? "h-3 w-10" : "h-4 w-16",
											)}
											aria-hidden="true"
										/>
									)}
								</div>
							</div>
						</motion.div>
					);

					return (
						<Fragment key={step.id}>
							<div
								className={cn(
									"flex flex-col items-center",
									compact ? "min-w-[68px]" : "min-w-[90px]",
								)}
							>
								<div className="group flex flex-col items-center">
									{nodeBody}
								</div>
							</div>
							{index < steps.length - 1 && (
								<motion.div
									className={cn(
										"h-0 flex-1 origin-left border-stroke-soft-100 border-t-[1.5px] border-dashed dark:border-neutral-800",
										compact ? "mt-3.5" : "mt-5",
									)}
									initial={reduceMotion ? false : { opacity: 0, scaleX: 0.4 }}
									animate={
										mounted
											? { opacity: 1, scaleX: 1 }
											: { opacity: 0, scaleX: 0.4 }
									}
									transition={{
										duration: 0.48,
										delay: 0.16 + index * STEP_STAGGER,
										ease: PAGE_EASE,
									}}
								/>
							)}
						</Fragment>
					);
				})}
			</div>
		</div>
	);
}
