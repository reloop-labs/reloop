"use client";

import NumberFlow from "@number-flow/react";
import { cn } from "@reloop/ui/cn";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import { Logo } from "@reloop/ui/logo";
import { AnimatePresence, motion } from "motion/react";
import { parseAsInteger, useQueryState } from "nuqs";
import type React from "react";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

interface SplitLayoutProps {
	stepIndicator: string;
	title?: string;
	children: React.ReactNode;
	previewContent?: React.ReactNode;
	fullWidth?: boolean;
	previewSize?: "small" | "medium";
	maxWidth?: "3xl" | "4xl" | "5xl";
}

export const SplitLayout = ({
	stepIndicator,
	title,
	children,
	previewContent,
	fullWidth = false,
	previewSize = "medium",
	maxWidth = "5xl",
}: SplitLayoutProps) => {
	const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1));
	const onBack = step > 1 ? () => setStep(step - 1) : undefined;
	const [hovered, setHovered] = useState(false);

	const easing = [0.4, 0, 0.2, 1] as const;
	const transition = { duration: 0.22, ease: easing };

	// Esc to go back
	useHotkeys("escape", () => onBack?.(), { enabled: !!onBack });

	// Extract the current step number for NumberFlow
	const stepMatch = stepIndicator.match(/Step (\d+) of (\d+)/);
	const currentStep = stepMatch ? Number(stepMatch[1]) : null;
	const totalSteps = stepMatch ? Number(stepMatch[2]) : null;

	return (
		<div className="flex min-h-screen flex-col items-center justify-center">
			<div className="-translate-x-1/2 absolute top-5 left-1/2 flex items-center space-x-2">
				<Logo className="h-10 w-10 lg:h-11 lg:w-11" />
				<span
					className="-ml-3 -mt-1 font-semibold text-text-strong-950 text-xl"
					style={{ fontFamily: "var(--font-outfit)" }}
				>
					reloop
				</span>
			</div>
			<div
				className={cn(
					"flex w-full flex-1 flex-col items-center justify-center border-stroke-soft-100 border-r border-l",
					maxWidth === "3xl"
						? "max-w-3xl"
						: maxWidth === "4xl"
							? "max-w-4xl"
							: "max-w-5xl",
				)}
			>
				<div className="w-full border-stroke-soft-100 border-t" />
				<div
					className={cn(
						"mx-auto grid h-full w-full",
						fullWidth
							? "lg:grid-cols-1"
							: previewSize === "small"
								? "lg:grid-cols-[1.2fr_0.8fr]"
								: "lg:grid-cols-2",
					)}
				>
					<div className="flex flex-col gap-4 px-12 pt-9 pb-9">
						<motion.button
							type="button"
							onClick={onBack}
							disabled={!onBack}
							onHoverStart={() => onBack && setHovered(true)}
							onHoverEnd={() => setHovered(false)}
							className={cn("group text-left", onBack && "cursor-pointer")}
						>
							{/* Step indicator row — icon + text */}
							<div className="flex items-center font-medium text-text-soft-400 text-xs transition-colors group-hover:text-text-strong-950">
								<AnimatePresence>
									{onBack && (
										<motion.span
											initial={{ opacity: 0, width: 0 }}
											animate={{ opacity: 1, width: "auto" }}
											exit={{ opacity: 0, width: 0 }}
											transition={transition}
											className="mb-px flex items-center overflow-hidden"
										>
											{/* Icon track */}
											<div className="relative flex h-3.5 w-3.5 items-center">
												{/* Tail — grows from left, anchored to chevron tip */}
												<motion.div
													className="-translate-y-1/2 absolute top-1/2 left-[1.5px] h-[1.5px] rounded-full bg-current"
													initial={{ width: 0, opacity: 0 }}
													animate={{
														width: hovered ? 10 : 0,
														opacity: hovered ? 1 : 0,
													}}
													transition={transition}
												/>
												{/* Chevron — stationary */}
												<svg
													width={6}
													height={10}
													viewBox="0 0 6 10"
													fill="none"
													className="absolute left-0"
												>
													<path
														d="M5 1L1.5 5L5 9"
														stroke="currentColor"
														strokeWidth={1.5}
														strokeLinecap="round"
														strokeLinejoin="round"
													/>
												</svg>
											</div>
										</motion.span>
									)}
								</AnimatePresence>
								{currentStep !== null && totalSteps !== null ? (
									<span className="mr-2 ml-px inline-flex items-center gap-1">
										Step
										<NumberFlow
											value={currentStep}
											className="tabular-nums"
											transformTiming={{ duration: 400, easing: "ease-out" }}
										/>
										of
										<NumberFlow
											value={totalSteps}
											className="tabular-nums"
											transformTiming={{ duration: 400, easing: "ease-out" }}
										/>
									</span>
								) : (
									stepIndicator
								)}
								{onBack && <KbdEsc />}
							</div>
						</motion.button>

						{title && <h1 className="font-semibold text-title-h5">{title}</h1>}
						{children}
					</div>
					{!fullWidth && previewContent && (
						<div className="relative hidden w-full overflow-hidden border-stroke-soft-100 border-l lg:flex">
							<div className="fade-in slide-in-from-bottom-8 relative z-10 w-full animate-in duration-700">
								{previewContent}
							</div>
						</div>
					)}
				</div>
				<div className="w-full border-stroke-soft-100 border-b" />
			</div>
		</div>
	);
};
