import NumberFlow from "@number-flow/react";
import { cn } from "@reloop/ui/cn";
import { Logo } from "@reloop/ui/logo";

import type { Variants } from "framer-motion";
import { AnimatePresence, motion } from "framer-motion";
import { useQueryState } from "nuqs";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { ThemeToggle } from "#/features/dashboard/page-header/theme-toggle";
import { onboardingStepParser } from "./onboarding-step";

const AnimatedHeight = ({ children }: { children: React.ReactNode }) => {
	const innerRef = useRef<HTMLDivElement>(null);
	const [height, setHeight] = useState<number | "auto">("auto");

	useEffect(() => {
		if (!innerRef.current) return;
		// Snapshot the initial height synchronously so the first render
		// doesn't animate from 0.
		setHeight(innerRef.current.offsetHeight);
		const ro = new ResizeObserver(() => {
			if (innerRef.current) {
				setHeight(innerRef.current.offsetHeight);
			}
		});
		ro.observe(innerRef.current);
		return () => ro.disconnect();
	}, []);

	return (
		<motion.div
			animate={{ height }}
			transition={
				height === "auto"
					? { duration: 0 }
					: { duration: 0.32, ease: [0.23, 1, 0.32, 1] }
			}
			// Clip vertical overflow for height animation only — keep action rows visible.
			className="min-w-0 overflow-y-hidden overflow-x-visible"
		>
			<div ref={innerRef} className="min-w-0 p-1.5">
				{children}
			</div>
		</motion.div>
	);
};

interface SplitLayoutProps {
	stepIndicator: string;
	children: React.ReactNode;
	previewContent?: React.ReactNode;
	fullWidth?: boolean;
	previewSize?: "small" | "medium";
	maxWidth?: "3xl" | "4xl" | "5xl";
	/** Whether to vertically center the content (default) or align to the top */
	verticalAlign?: "center" | "start";
}

const contentVariants: Variants = {
	initial: (dir: number) => ({
		opacity: 0,
		filter: "blur(8px)",
		transform: `translateX(${dir * 14}px)`,
	}),
	animate: {
		opacity: 1,
		filter: "blur(0px)",
		transform: "translateX(0px)",
		transition: {
			duration: 0.28,
			ease: [0.23, 1, 0.32, 1] as const,
		},
	},
	exit: (dir: number) => ({
		opacity: 0,
		filter: "blur(6px)",
		transform: `translateX(${dir * -14}px)`,
		transition: {
			duration: 0.18,
			ease: [0.23, 1, 0.32, 1] as const,
		},
	}),
};

const previewVariants: Variants = {
	initial: (dir: number) => ({
		opacity: 0,
		filter: "blur(8px)",
		transform: `translateY(${dir * 12}px)`,
	}),
	animate: {
		opacity: 1,
		filter: "blur(0px)",
		transform: "translateY(0px)",
		transition: {
			duration: 0.3,
			ease: [0.23, 1, 0.32, 1] as const,
			delay: 0.05,
		},
	},
	exit: (dir: number) => ({
		opacity: 0,
		filter: "blur(6px)",
		transform: `translateY(${dir * -12}px)`,
		transition: {
			duration: 0.18,
			ease: [0.23, 1, 0.32, 1] as const,
		},
	}),
};

export function SplitLayout({
	stepIndicator,
	children,
	previewContent,
	fullWidth = false,
	previewSize = "medium",
	maxWidth = "5xl",
	verticalAlign = "center",
}: SplitLayoutProps) {
	const [step] = useQueryState("step", onboardingStepParser);

	const prevStepRef = useRef(0);
	const directionRef = useRef<1 | -1>(1);
	if (prevStepRef.current === 0) {
		prevStepRef.current = step;
	} else if (step !== prevStepRef.current) {
		directionRef.current = step > prevStepRef.current ? 1 : -1;
		prevStepRef.current = step;
	}
	const direction = directionRef.current;

	// Browser back / Esc use history — step advances push entries (see onboardingStepParser).
	useHotkeys(
		"escape",
		() => {
			if (step > 1) {
				window.history.back();
			}
		},
		{ enabled: step > 1 },
	);

	const stepMatch = stepIndicator.match(/Step (\d+) of (\d+)/);
	const currentStep = stepMatch ? Number(stepMatch[1]) : null;
	const totalSteps = stepMatch ? Number(stepMatch[2]) : null;

	return (
		<div className="relative flex min-h-screen w-full flex-col items-center">
			{/* Quiet corner control so users can switch theme without hunting settings. */}
			<div className="fixed right-5 bottom-5 z-50 sm:right-6 sm:bottom-6">
				<ThemeToggle />
			</div>
			<div
				className="relative flex min-h-screen w-full flex-col border-stroke-soft-100 border-r border-l dark:border-stroke-soft-100/40"
				style={{
					maxWidth:
						maxWidth === "3xl"
							? "48rem"
							: maxWidth === "4xl"
								? "56rem"
								: "64rem",
					transition: "max-width 0.28s cubic-bezier(0.23, 1, 0.32, 1)",
				}}
			>
				<div className="-translate-x-1/2 absolute top-5 left-1/2 z-50 flex items-center space-x-2">
					<Logo className="h-10 w-10 lg:h-11 lg:w-11" />
					<span className="-ml-3 font-semibold text-text-strong-950 text-xl">
						Reloop
					</span>
				</div>
				<div
					className={cn(
						"flex w-full flex-1 flex-col",
						verticalAlign === "center"
							? "justify-center"
							: "justify-start pt-24 pb-20",
					)}
				>
					<div className="w-full border-stroke-soft-100 border-t border-b dark:border-stroke-soft-100/40">
						<div
							className="mx-auto grid w-full"
							style={{
								gridTemplateColumns: fullWidth
									? "1fr 0px"
									: previewSize === "small"
										? "1.2fr 0.8fr"
										: "1fr 1fr",
								transition:
									"grid-template-columns 0.28s cubic-bezier(0.23, 1, 0.32, 1)",
							}}
						>
							<div className="flex min-w-0 flex-col gap-1 px-6 pt-10 pb-10 sm:px-10 md:px-12">
								<div className="font-medium text-text-soft-400 text-xs">
									{currentStep !== null && totalSteps !== null ? (
										<span className="inline-flex items-center gap-1 px-1.5">
											Step
											<NumberFlow
												value={currentStep}
												className="tabular-nums"
												transformTiming={{
													duration: 400,
													easing: "ease-out",
												}}
											/>
											of
											<NumberFlow
												value={totalSteps}
												className="tabular-nums"
												transformTiming={{
													duration: 400,
													easing: "ease-out",
												}}
											/>
										</span>
									) : (
										stepIndicator
									)}
								</div>

								<AnimatedHeight>
									<AnimatePresence
										mode="wait"
										initial={true}
										custom={direction}
									>
										<motion.div
											key={step}
											custom={direction}
											variants={contentVariants}
											initial="initial"
											animate="animate"
											exit="exit"
											className="flex flex-col gap-4"
										>
											{children}
										</motion.div>
									</AnimatePresence>
								</AnimatedHeight>
							</div>

							<div
								className="relative hidden overflow-hidden border-stroke-soft-100 border-l lg:flex dark:border-stroke-soft-100/40"
								style={{
									opacity: fullWidth || !previewContent ? 0 : 1,
									pointerEvents: fullWidth || !previewContent ? "none" : "auto",
									transition: "opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
								}}
							>
								<AnimatePresence mode="wait" initial={true} custom={direction}>
									<motion.div
										key={step}
										custom={direction}
										variants={previewVariants}
										initial="initial"
										animate="animate"
										exit="exit"
										className="relative z-10 w-full"
									>
										{previewContent}
									</motion.div>
								</AnimatePresence>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
