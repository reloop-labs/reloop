"use client";

import { Logo } from "@reloop/ui/logo";
import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode, useEffect, useRef, useState } from "react";

/**
 * Smoothly animates height when step content changes size.
 * Only wraps the white panel — the soft footer strip stays outside so it
 * never collapses and "pops" when footer copy swaps.
 */
function measureHeight(el: HTMLElement) {
	// ceil + 1px buffer so bottom borders aren't clipped by overflow:hidden
	// (subpixel rounding / margin collapse often short by 1px).
	return Math.ceil(el.getBoundingClientRect().height) + 1;
}

function AnimatedHeight({ children }: { children: ReactNode }) {
	const innerRef = useRef<HTMLDivElement>(null);
	const [height, setHeight] = useState<number | "auto">("auto");

	useEffect(() => {
		if (!innerRef.current) return;
		// Snapshot the initial height so the first paint doesn't animate from 0.
		setHeight(measureHeight(innerRef.current));
		const ro = new ResizeObserver(() => {
			if (innerRef.current) {
				setHeight(measureHeight(innerRef.current));
			}
		});
		ro.observe(innerRef.current);
		return () => ro.disconnect();
	}, []);

	return (
		<motion.div
			initial={false}
			animate={{ height }}
			transition={
				height === "auto"
					? { duration: 0 }
					: { duration: 0.38, ease: [0.23, 1, 0.32, 1] }
			}
			className="overflow-hidden"
		>
			{/* p-0.5 is measured (unlike margin) so the white panel border stays visible */}
			<div ref={innerRef} className="p-0.5">
				{children}
			</div>
		</motion.div>
	);
}

/** Same horizontal slide as card body steps (forward → exit left / enter right). */
const footerStepVariants = {
	initial: (direction: number) => ({
		opacity: 0,
		x: direction > 0 ? 16 : -16,
	}),
	animate: {
		opacity: 1,
		x: 0,
		position: "relative" as const,
	},
	exit: (direction: number) => ({
		opacity: 0,
		x: direction > 0 ? -16 : 16,
		position: "absolute" as const,
		top: 0,
		left: 0,
		right: 0,
	}),
};

/**
 * Auth form card shell — same chrome as the add-contact method card.
 * Outer soft shell + inset white panel; footer sits in the outer shell and
 * always keeps its strip height. Footer slides horizontally with step direction.
 */
export function AuthCard({
	children,
	footer,
	footerKey = "footer",
	/** Step direction from useAuthStepDirection — footer slides with the card body. */
	direction = 1,
	showBrandMark = true,
}: {
	children: ReactNode;
	/** Soft outer-shell footer (e.g. "Already have an account?"). */
	footer?: ReactNode;
	/** Stable key for footer content transition between steps. */
	footerKey?: string;
	direction?: number;
	/** Gray two-layer logo tile above step content (default true). */
	showBrandMark?: boolean;
}) {
	return (
		<div className="w-full font-sans">
			{/* Outer soft shell */}
			<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 dark:border-stroke-soft-100/60">
				{/* White panel height-animates alone */}
				<AnimatedHeight>
					<div className="space-y-6 overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-6 pt-5 pb-7 dark:border-stroke-soft-100/60">
						{showBrandMark ? (
							<div
								className="w-fit overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-soft-50 dark:border-stroke-soft-100/60"
								aria-hidden
							>
								<div className="m-px flex size-11 items-center justify-center rounded-[14px] border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/60">
									<Logo className="h-10 w-10" />
								</div>
							</div>
						) : null}

						{children}
					</div>
				</AnimatedHeight>

				{/* Footer strip — same L/R slide as the card body steps */}
				{footer != null ? (
					<div className="relative min-h-12 overflow-hidden px-6 pt-3.5 pb-4 font-medium text-[13px] text-text-sub-600 dark:bg-bg-weak-50/40">
						<AnimatePresence mode="sync" custom={direction} initial={false}>
							<motion.div
								key={footerKey}
								custom={direction}
								variants={footerStepVariants}
								initial="initial"
								animate="animate"
								exit="exit"
								transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
							>
								{footer}
							</motion.div>
						</AnimatePresence>
					</div>
				) : null}
			</div>
		</div>
	);
}

/** Title + description + dashed rule for a step inside AuthCard. */
export function AuthCardHeader({
	title,
	description,
}: {
	title: ReactNode;
	description?: ReactNode;
}) {
	return (
		<div>
			<h2 className="font-semibold text-text-strong-950 text-xl tracking-tight">
				{title}
			</h2>
			{description ? (
				<div className="mt-0.5 font-medium text-sm text-text-sub-600 leading-relaxed">
					{description}
				</div>
			) : null}

			<div
				className="mt-4 border-stroke-soft-200 border-t border-dashed pb-2 dark:border-stroke-soft-100/60"
				aria-hidden
			/>
		</div>
	);
}
