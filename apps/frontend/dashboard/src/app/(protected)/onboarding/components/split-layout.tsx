"use client";

import NumberFlow from "@number-flow/react";
import { cn } from "@reloop/ui/cn";
import { KbdEsc } from "@reloop/ui/kbd-esc";
import { Logo } from "@reloop/ui/logo";
import type { Variants } from "motion/react";
import { AnimatePresence, motion } from "motion/react";
import { parseAsInteger, useQueryState } from "nuqs";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Calligraph } from "calligraph";

// Smoothly animates height changes using a ResizeObserver + CSS transition.
// Deliberately avoids Framer Motion layout so it can't conflict with slide animations.
const AnimatedHeight = ({ children }: { children: React.ReactNode }) => {
	const innerRef = useRef<HTMLDivElement>(null);
	const [height, setHeight] = useState<number | undefined>(undefined);

	useEffect(() => {
		if (!innerRef.current) return;
		const ro = new ResizeObserver((entries: ResizeObserverEntry[]) => {
			const entry = entries[0];
			if (!entry) return;
			setHeight(entry.contentRect.height);
		});
		ro.observe(innerRef.current);
		return () => ro.disconnect();
	}, []);

	return (
		<div
			style={{
				height: height === undefined ? "auto" : height,
				transition: "height 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
				overflow: "hidden",
			}}
		>
			<div ref={innerRef}>{children}</div>
		</div>
	);
};

// Title that fluidly transitions its characters when the text changes between steps.
// Calligraph uses LCS diffing: shared chars slide to new positions, new chars fade in.
const ScrambleTitle = ({ text }: { text: string }) => (
	<Calligraph
		as="h1"
		className="font-semibold text-title-h5"
		animation="snappy"
		trend={-1}
		drift={{ x: 4, y: 0 }}
		stagger={0.015}
	>
		{text}
	</Calligraph>
);

interface SplitLayoutProps {
	stepIndicator: string;
	title?: string;
	children: React.ReactNode;
	previewContent?: React.ReactNode;
	fullWidth?: boolean;
	previewSize?: "small" | "medium";
	maxWidth?: "3xl" | "4xl" | "5xl";
	/** Called before stepping back — use to clear URL params set in the current step */
	onBack?: () => void;
	/** Override the target step when going back (defaults to step - 1) */
	backStep?: number;
}

export const SplitLayout = ({
	stepIndicator,
	title,
	children,
	previewContent,
	fullWidth = false,
	previewSize = "medium",
	maxWidth = "5xl",
	onBack: onBackCleanup,
	backStep,
}: SplitLayoutProps) => {
	const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1));
	const [hovered, setHovered] = useState(false);

	// Compute direction synchronously during render.
	// prevStepRef starts at 0 (sentinel) so the first render just initialises it.
	// Works correctly with React Strict Mode double-renders because:
	//   - both renders share the same ref object
	//   - first render updates ref; second render sees step===prev → no-op
	const prevStepRef = useRef(0);
	const directionRef = useRef<1 | -1>(1);
	if (prevStepRef.current === 0) {
		prevStepRef.current = step; // initialise on mount
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

	const easing = [0.4, 0, 0.2, 1] as const;
	const transition = { duration: 0.22, ease: easing };

	// Esc to go back
	useHotkeys("escape", () => onBack?.(), { enabled: !!onBack });

	// Extract the current step number for NumberFlow
	const stepMatch = stepIndicator.match(/Step (\d+) of (\d+)/);
	const currentStep = stepMatch ? Number(stepMatch[1]) : null;
	const totalSteps = stepMatch ? Number(stepMatch[2]) : null;

	const slideDistance = 14;
	// Left panel: enters from right (forward) / left (back); exits left/right
	const contentVariants: Variants = {
		initial: (dir: number) => ({
			opacity: 0,
			x: dir * slideDistance,
		}),
		animate: {
			opacity: 1,
			x: 0,
			transition: { duration: 0.28, ease: [0.0, 0.0, 0.2, 1] as const },
		},
		exit: (dir: number) => ({
			opacity: 0,
			x: dir * -slideDistance,
			transition: { duration: 0.12, ease: [0.4, 0, 1, 1] as const },
		}),
	};

	// Right panel: enters from bottom/top; exits up/down
	const previewVariants: Variants = {
		initial: (dir: number) => ({
			opacity: 0,
			y: dir * 12,
		}),
		animate: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.3,
				ease: [0.0, 0.0, 0.2, 1] as const,
				delay: 0.05,
			},
		},
		exit: (dir: number) => ({
			opacity: 0,
			y: dir * -12,
			transition: { duration: 0.12, ease: [0.4, 0, 1, 1] as const },
		}),
	};

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
				className="flex w-full flex-1 flex-col items-center justify-center border-stroke-soft-100 border-r border-l dark:border-stroke-soft-100/40"
				style={{
					maxWidth:
						maxWidth === "3xl"
							? "48rem"
							: maxWidth === "4xl"
								? "56rem"
								: "64rem",
					transition: "max-width 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
				}}
			>
				<div className="w-full border-stroke-soft-100 border-t dark:border-stroke-soft-100/40" />
				<div
					className="mx-auto grid h-full w-full"
					style={{
						gridTemplateColumns: fullWidth
							? "1fr 0px"
							: previewSize === "small"
								? "1.2fr 0.8fr"
								: "1fr 1fr",
						transition: "grid-template-columns 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
					}}
				>
					<div className="flex flex-col gap-4 overflow-hidden px-12 pt-9 pb-9">
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
												{/* Tail */}
												<motion.div
													className="-translate-y-1/2 absolute top-1/2 left-[1.5px] h-[1.5px] rounded-full bg-current"
													initial={{ width: 0, opacity: 0 }}
													animate={{
														width: hovered ? 10 : 0,
														opacity: hovered ? 1 : 0,
													}}
													transition={transition}
												/>
												{/* Chevron */}
												<svg width={6} height={10} viewBox="0 0 6 10" fill="none" className="absolute left-0">
													<path d="M5 1L1.5 5L5 9" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
												</svg>
											</div>
										</motion.span>
									)}
								</AnimatePresence>
								{currentStep !== null && totalSteps !== null ? (
									<span className="mr-2 ml-px inline-flex items-center gap-1">
										Step
										<NumberFlow value={currentStep} className="tabular-nums" transformTiming={{ duration: 400, easing: "ease-out" }} />
										of
										<NumberFlow value={totalSteps} className="tabular-nums" transformTiming={{ duration: 400, easing: "ease-out" }} />
									</span>
								) : (
									stepIndicator
								)}
								{onBack && <KbdEsc />}
							</div>
						</motion.button>

						{/* Title stays fixed; only the text scrambles when step changes */}
						{title && <ScrambleTitle text={title} />}

						{/* Animated step content */}
						<AnimatedHeight>
							<AnimatePresence mode="wait" initial={false} custom={direction}>
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

					{/* Right panel — always in DOM, collapses via grid-template-columns */}
					<div
						className="relative hidden overflow-hidden border-stroke-soft-100 border-l lg:flex dark:border-stroke-soft-100/40"
						style={{
							opacity: fullWidth || !previewContent ? 0 : 1,
							pointerEvents: fullWidth || !previewContent ? "none" : "auto",
							transition: "opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
						}}
					>
						<AnimatePresence mode="wait" initial={false} custom={direction}>
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
				<div className="w-full border-stroke-soft-100 border-b dark:border-stroke-soft-100/40" />
			</div>
		</div>
	);
};
