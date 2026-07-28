import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";

import type { Variants } from "framer-motion";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { parseAsInteger, useQueryState } from "nuqs";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

const AnimatedHeight = ({
	children,
	skipAnimation,
}: {
	children: React.ReactNode;
	skipAnimation: boolean;
}) => {
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
				skipAnimation || height === "auto"
					? { duration: 0 }
					: { duration: 0.32, ease: [0.23, 1, 0.32, 1] }
			}
			style={{ overflow: "hidden" }}
		>
			<div ref={innerRef} className="p-1.5">
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
	/** Called before stepping back — use to clear URL params set in the current step */
	onBack?: () => void;
	/** Override the target step when going back (defaults to step - 1) */
	backStep?: number;
	/** Whether to vertically center the content (default) or align to the top */
	verticalAlign?: "center" | "start";
}

export function SplitLayout({
	stepIndicator,
	children,
	previewContent,
	fullWidth = false,
	maxWidth = "5xl",
	onBack: onBackCleanup,
	backStep,
	verticalAlign = "center",
}: SplitLayoutProps) {
	const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1));
	const prefersReducedMotion = useReducedMotion();
	const isKeyboardRef = useRef(false);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (
				e.key === "Escape" ||
				(e.key === "Enter" && (e.metaKey || e.ctrlKey)) ||
				(e.key === "s" && e.altKey) ||
				e.key === "Enter"
			) {
				isKeyboardRef.current = true;
			}
		};
		const handlePointerDown = () => {
			isKeyboardRef.current = false;
		};

		window.addEventListener("keydown", handleKeyDown, { capture: true });
		window.addEventListener("pointerdown", handlePointerDown, {
			capture: true,
		});

		return () => {
			window.removeEventListener("keydown", handleKeyDown, { capture: true });
			window.removeEventListener("pointerdown", handlePointerDown, {
				capture: true,
			});
		};
	}, []);

	const prevStepRef = useRef(0);
	const directionRef = useRef<1 | -1>(1);
	if (prevStepRef.current === 0) {
		prevStepRef.current = step;
	} else if (step !== prevStepRef.current) {
		directionRef.current = step > prevStepRef.current ? 1 : -1;
		prevStepRef.current = step;
	}
	const direction = directionRef.current;

	const handleBack = () => {
		if (onBackCleanup) onBackCleanup();
		const targetStep = backStep ?? Math.max(1, step - 1);
		void setStep(targetStep);
	};

	const stepMatch = stepIndicator.match(/Step (\d+) of (\d+)/);
	const currentStep = stepMatch ? Number(stepMatch[1]) : null;
	const totalSteps = stepMatch ? Number(stepMatch[2]) : null;

	const isKeyboard = isKeyboardRef.current;
	const shouldSkipMotion = !!prefersReducedMotion || isKeyboard;

	const slideDistance = shouldSkipMotion ? 0 : 14;
	const contentVariants: Variants = {
		initial: (dir: number) => ({
			opacity: 0,
			transform: `translateX(${dir * slideDistance}px)`,
		}),
		animate: {
			opacity: 1,
			transform: "translateX(0px)",
			transition: {
				duration: shouldSkipMotion ? 0 : 0.25,
				ease: [0.23, 1, 0.32, 1] as const,
			},
		},
		exit: (dir: number) => ({
			opacity: 0,
			transform: `translateX(${dir * -slideDistance}px)`,
			transition: {
				duration: shouldSkipMotion ? 0 : 0.15,
				ease: [0.23, 1, 0.32, 1] as const,
			},
		}),
	};

	const previewVariants: Variants = {
		initial: (dir: number) => ({
			opacity: 0,
			transform: `translateY(${dir * (shouldSkipMotion ? 0 : 12)}px)`,
		}),
		animate: {
			opacity: 1,
			transform: "translateY(0px)",
			transition: {
				duration: shouldSkipMotion ? 0 : 0.28,
				ease: [0.23, 1, 0.32, 1] as const,
				delay: shouldSkipMotion ? 0 : 0.05,
			},
		},
		exit: (dir: number) => ({
			opacity: 0,
			transform: `translateY(${dir * -(shouldSkipMotion ? 0 : 12)}px)`,
			transition: {
				duration: shouldSkipMotion ? 0 : 0.15,
				ease: [0.23, 1, 0.32, 1] as const,
			},
		}),
	};

	const hasPreview = !fullWidth && Boolean(previewContent);

	return (
		<div className="relative flex h-screen max-h-screen w-full flex-col overflow-hidden bg-bg-white-0 lg:flex-row">
			{/* Left Column: Content / Form (Scrollable) */}
			<div
				className={cn(
					"relative flex h-full w-full flex-col overflow-y-auto",
					hasPreview
						? "w-full border-stroke-soft-100 lg:w-1/2 lg:border-r dark:border-stroke-soft-100/40"
						: "w-full items-center",
				)}
			>
				{/* Sticky Top Bar: Back Button (Left) + Step Indicator (Right) */}
				<div className="sticky top-0 z-40 flex w-full items-center justify-between border-stroke-soft-100/60 border-b bg-bg-white-0/90 px-6 py-4 backdrop-blur-md sm:px-12 lg:px-16 xl:px-24 dark:border-stroke-soft-100/40 dark:bg-bg-white-0/80">
					{/* Left: Back Button */}
					<div className="flex min-h-[24px] items-center">
						{currentStep !== null && currentStep > 1 && (
							<button
								type="button"
								onClick={handleBack}
								aria-label="Go back to previous step"
								className="flex cursor-pointer items-center gap-1 font-medium text-text-sub-600 text-xs transition-colors hover:text-text-strong-950"
							>
								<Icon name="arrow-left" className="h-3.5 w-3.5" />
								<span>Back</span>
							</button>
						)}
					</div>

					{/* Right: Step Indicator */}
					<div className="flex items-center gap-4">
						{currentStep !== null && totalSteps !== null ? (
							<div className="flex items-center gap-1.5">
								{Array.from({ length: totalSteps }, (_, i) => {
									const stepNum = i + 1;
									const isActive = stepNum <= currentStep;
									return (
										<div
											key={stepNum}
											className={cn(
												"h-1 w-8 rounded-full transition-all duration-300 sm:w-10",
												isActive
													? "bg-primary-base"
													: "bg-stroke-soft-200 dark:bg-stroke-soft-100/40",
											)}
										/>
									);
								})}
							</div>
						) : (
							<span className="font-medium text-text-soft-400 text-xs">
								{stepIndicator}
							</span>
						)}
					</div>
				</div>

				{/* Main Content Area */}
				<div
					className={cn(
						"flex flex-1 flex-col px-6 py-12 sm:px-12 lg:px-16 xl:px-24",
						verticalAlign === "center" ? "justify-center" : "justify-start",
					)}
				>
					<div
						className={cn(
							"w-full",
							hasPreview
								? "mx-auto max-w-md"
								: maxWidth === "3xl"
									? "mx-auto max-w-3xl"
									: maxWidth === "4xl"
										? "mx-auto max-w-4xl"
										: "mx-auto max-w-2xl",
						)}
					>
						<div className="flex flex-col gap-4">{children}</div>
					</div>
				</div>
			</div>

			{/* Right Column: Animation / Preview (Fixed, Non-scrollable) */}
			{hasPreview && (
				<div className="relative hidden h-full w-1/2 items-center justify-center overflow-hidden bg-bg-weak-50/40 p-8 lg:flex dark:bg-bg-weak-50/10">
					<AnimatePresence mode="wait" initial={true} custom={direction}>
						<motion.div
							key={step}
							custom={direction}
							variants={previewVariants}
							initial="initial"
							animate="animate"
							exit="exit"
							className="relative z-10 flex h-full w-full items-center justify-center overflow-hidden"
						>
							{previewContent}
						</motion.div>
					</AnimatePresence>
					{/* Bottom Gradient Fade */}
					<div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-44 bg-gradient-to-t from-bg-weak-50 via-bg-weak-50/70 to-transparent dark:from-bg-weak-50/60 dark:via-bg-weak-50/20" />
				</div>
			)}
		</div>
	);
}
