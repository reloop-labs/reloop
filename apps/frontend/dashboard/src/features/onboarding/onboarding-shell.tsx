import { Logo } from "@reloop/ui/logo";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { ThemeToggle } from "#/features/dashboard/page-header/theme-toggle";

/** Same motion as the landing-page mega menu (`header.tsx`). */
const EASE_DEFAULT: [number, number, number, number] = [0.25, 0.1, 0.25, 1];
const SLIDE_PX = 200;
const SLIDE_S = 0.25;
const SHELL_SPRING = { type: "spring", bounce: 0, duration: 0.32 } as const;

const STEP_WIDTH_PX = {
	1: 1024,
	2: 768,
} as const;

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

export function OnboardingShell({
	step,
	children,
}: {
	step: number;
	children: ReactNode;
}) {
	const shouldReduceMotion = useReducedMotion();
	const reduce = Boolean(shouldReduceMotion);

	const prevStepRef = useRef(step);
	const directionRef = useRef(0);
	if (prevStepRef.current !== step) {
		directionRef.current = step > prevStepRef.current ? 1 : -1;
		prevStepRef.current = step;
	}
	const direction = directionRef.current;

	const targetWidth = step === 2 ? STEP_WIDTH_PX[2] : STEP_WIDTH_PX[1];
	const [viewportCap, setViewportCap] = useState(targetWidth);
	const contentRef = useRef<HTMLDivElement>(null);
	const [bandHeight, setBandHeight] = useState<number | "auto">("auto");

	useLayoutEffect(() => {
		const sync = () => setViewportCap(window.innerWidth);
		sync();
		window.addEventListener("resize", sync);
		return () => window.removeEventListener("resize", sync);
	}, []);

	useLayoutEffect(() => {
		const el = contentRef.current;
		if (!el) return;
		const measure = () => setBandHeight(el.offsetHeight);
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(el);
		return () => ro.disconnect();
	}, [step]);

	const shellWidth = Math.min(targetWidth, viewportCap);

	return (
		<div className="relative flex min-h-screen w-full flex-col items-center overflow-x-clip">
			<div className="fixed right-5 bottom-5 z-50 sm:right-6 sm:bottom-6">
				<ThemeToggle />
			</div>
			<motion.div
				initial={false}
				animate={{ width: shellWidth }}
				transition={reduce ? { duration: 0 } : SHELL_SPRING}
				className="relative flex min-h-screen w-full flex-col border-stroke-soft-100 border-x dark:border-stroke-soft-100/40"
			>
				<a
					href="/home"
					aria-label="Reloop home"
					className="absolute top-5 left-1/2 z-50 flex -translate-x-1/2 items-center space-x-2 transition-opacity hover:opacity-80"
				>
					<Logo className="h-10 w-10 lg:h-11 lg:w-11" />
					<span className="-ml-3 font-semibold text-text-strong-950 text-xl">
						Reloop
					</span>
				</a>
				<div className="flex w-full flex-1 flex-col justify-center pt-24 pb-20">
					<motion.div
						initial={false}
						animate={{
							height: reduce || bandHeight === "auto" ? "auto" : bandHeight,
						}}
						transition={reduce ? { duration: 0 } : SHELL_SPRING}
						className="w-full border-stroke-soft-100 border-y bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-bg-white-0"
						style={{ overflow: "hidden" }}
					>
						<div ref={contentRef} className="relative w-full">
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
									{children}
								</motion.div>
							</AnimatePresence>
						</div>
					</motion.div>
				</div>
			</motion.div>
		</div>
	);
}
