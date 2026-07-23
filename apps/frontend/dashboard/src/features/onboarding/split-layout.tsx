import NumberFlow from "@number-flow/react";
import { cn } from "@reloop/ui/cn";
import { KbdEsc } from "@reloop/ui/kbd-esc";
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
	previewSize = "medium",
	maxWidth = "5xl",
	onBack: onBackCleanup,
	backStep,
	verticalAlign = "center",
}: SplitLayoutProps) {
	const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1));
	const [hovered, setHovered] = useState(false);
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

	const canGoBack = step > 1;
	const onBack = canGoBack
		? () => {
				onBackCleanup?.();
				setStep(backStep ?? step - 1);
			}
		: undefined;

	const easing = [0.23, 1, 0.32, 1] as const;
	const transition = { duration: 0.2, ease: easing };

	useHotkeys("escape", () => onBack?.(), { enabled: !!onBack });

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

	return (
		<div className="flex min-h-screen w-full flex-col items-center">
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
							<div className="flex flex-col gap-4 px-12 pt-10 pb-10">
								<motion.button
									type="button"
									onClick={onBack}
									disabled={!onBack}
									onHoverStart={() => onBack && setHovered(true)}
									onHoverEnd={() => setHovered(false)}
									className={cn("group text-left", onBack && "cursor-pointer")}
								>
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
													<div className="relative flex h-3.5 w-3.5 items-center">
														<motion.div
															className="-translate-y-1/2 absolute top-1/2 left-[1.5px] h-[1.5px] rounded-full bg-current"
															initial={{ width: 0, opacity: 0 }}
															animate={{
																width: hovered ? 10 : 0,
																opacity: hovered ? 1 : 0,
															}}
															transition={transition}
														/>
														<svg
															width={6}
															height={10}
															viewBox="0 0 6 10"
															fill="none"
															className="absolute left-0"
															aria-hidden="true"
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
													transformTiming={{
														duration: shouldSkipMotion ? 0 : 400,
														easing: "ease-out",
													}}
												/>
												of
												<NumberFlow
													value={totalSteps}
													className="tabular-nums"
													transformTiming={{
														duration: shouldSkipMotion ? 0 : 400,
														easing: "ease-out",
													}}
												/>
											</span>
										) : (
											stepIndicator
										)}
										{onBack && <KbdEsc />}
									</div>
								</motion.button>

								<AnimatedHeight skipAnimation={shouldSkipMotion}>
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
