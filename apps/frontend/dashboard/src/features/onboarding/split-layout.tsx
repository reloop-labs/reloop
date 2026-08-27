import NumberFlow from "@number-flow/react";
import { cn } from "@reloop/ui/cn";
import { Logo } from "@reloop/ui/logo";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useQueryState } from "nuqs";
import type React from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { ThemeToggle } from "#/features/dashboard/page-header/theme-toggle";
import { onboardingStepParser } from "./onboarding-step";

/** Same motion as the landing-page mega menu (`header.tsx`). */
const EASE_DEFAULT: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
const SLIDE_PX = 200;
const SLIDE_S = 0.25;
const SHELL_SPRING = { type: "spring", bounce: 0, duration: 0.32 } as const;

const contentVariants = {
	enter: (dir: number) => ({
		opacity: 0,
		x: dir > 0 ? SLIDE_PX : dir < 0 ? -SLIDE_PX : 0,
	}),
	center: {
		opacity: 1,
		x: 0,
	},
	exit: (dir: number) => ({
		opacity: 0,
		x: dir > 0 ? -SLIDE_PX : dir < 0 ? SLIDE_PX : 0,
	}),
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

function desktopWidthPx(maxWidth: "3xl" | "4xl" | "5xl"): number {
	if (maxWidth === "3xl") return 768;
	if (maxWidth === "4xl") return 896;
	return 1024;
}

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
	const shouldReduceMotion = useReducedMotion();

	const prevStepRef = useRef(0);
	const directionRef = useRef<1 | -1>(1);
	if (prevStepRef.current === 0) {
		prevStepRef.current = step;
	} else if (step !== prevStepRef.current) {
		directionRef.current = step > prevStepRef.current ? 1 : -1;
		prevStepRef.current = step;
	}
	const direction = directionRef.current;

	const [isLg, setIsLg] = useState(false);
	const [viewportCap, setViewportCap] = useState(1024);
	const contentRef = useRef<HTMLDivElement>(null);
	const [shellHeight, setShellHeight] = useState<number | "auto">("auto");

	useLayoutEffect(() => {
		const mq = window.matchMedia("(min-width: 1024px)");
		const sync = () => {
			setIsLg(mq.matches);
			setViewportCap(window.innerWidth - 32);
		};
		sync();
		mq.addEventListener("change", sync);
		window.addEventListener("resize", sync);
		return () => {
			mq.removeEventListener("change", sync);
			window.removeEventListener("resize", sync);
		};
	}, []);

	const showPreview = Boolean(previewContent) && !fullWidth;
	const targetWidth = isLg
		? desktopWidthPx(maxWidth)
		: fullWidth
			? 576
			: 512;
	const shellWidth = Math.min(targetWidth, viewportCap);

	useLayoutEffect(() => {
		const el = contentRef.current;
		if (!el) return;
		const measure = () => {
			setShellHeight(el.offsetHeight);
		};
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(el);
		return () => ro.disconnect();
	}, [step, children, previewContent, shellWidth]);

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

	const reduce = Boolean(shouldReduceMotion);

	return (
		<div className="relative flex min-h-screen w-full flex-col items-center overflow-x-clip">
			<div className="fixed right-5 bottom-5 z-50 sm:right-6 sm:bottom-6">
				<ThemeToggle />
			</div>
			<a
				href="/home"
				aria-label="Reloop home"
				className="-translate-x-1/2 absolute top-5 left-1/2 z-50 flex items-center space-x-2 transition-opacity hover:opacity-80"
			>
				<Logo className="h-10 w-10 lg:h-11 lg:w-11" />
				<span className="-ml-3 font-semibold text-text-strong-950 text-xl">
					Reloop
				</span>
			</a>
			<div
				className={cn(
					"flex w-full flex-1 flex-col items-center px-4",
					verticalAlign === "center"
						? "justify-center pt-24 pb-16"
						: "justify-start pt-24 pb-20",
				)}
			>
				<motion.div
					initial={false}
					animate={{
						width: shellWidth,
						height: reduce || shellHeight === "auto" ? "auto" : shellHeight,
					}}
					transition={reduce ? { duration: 0 } : SHELL_SPRING}
					className="relative border-stroke-soft-100 border-x border-t border-b bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-bg-white-0"
					style={{
						overflow: "hidden",
						maxWidth: "calc(100vw - 2rem)",
					}}
				>
					<div ref={contentRef} className="relative w-full">
						<div className="px-5 pt-8 sm:px-8 lg:px-12">
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
						</div>

						<AnimatePresence
							initial={false}
							custom={direction}
							mode="popLayout"
						>
							<motion.div
								key={step}
								custom={direction}
								variants={contentVariants}
								initial={reduce ? false : "enter"}
								animate="center"
								exit={reduce ? undefined : "exit"}
								transition={
									reduce
										? { duration: 0 }
										: { duration: SLIDE_S, ease: EASE_DEFAULT }
								}
								className="w-full"
							>
								<div
									className={cn(
										"grid w-full grid-cols-1",
										showPreview &&
											(previewSize === "small"
												? "lg:grid-cols-[1.2fr_0.8fr]"
												: "lg:grid-cols-2"),
									)}
								>
									<div className="flex min-w-0 flex-col gap-4 px-5 pt-2 pb-8 sm:px-8 sm:pb-10 lg:px-12">
										{children}
									</div>
									{showPreview ? (
										<div className="relative hidden min-h-[28rem] min-w-0 overflow-hidden border-stroke-soft-100 border-l lg:block dark:border-stroke-soft-100/40">
											{previewContent}
										</div>
									) : null}
								</div>
							</motion.div>
						</AnimatePresence>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
