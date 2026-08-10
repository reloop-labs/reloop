"use client";

import { Logo } from "@reloop/ui/logo";
import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode, useEffect, useRef, useState } from "react";

/**
 * Smoothly animates height when step content changes size.
 * Only wraps the white panel — the soft footer strip stays outside so it
 * never collapses and "pops" when footer copy swaps.
 */
function AnimatedHeight({ children }: { children: ReactNode }) {
	const innerRef = useRef<HTMLDivElement>(null);
	const [height, setHeight] = useState<number | "auto">("auto");

	useEffect(() => {
		if (!innerRef.current) return;
		// Snapshot the initial height so the first paint doesn't animate from 0.
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
			initial={false}
			animate={{ height }}
			transition={
				height === "auto"
					? { duration: 0 }
					: { duration: 0.38, ease: [0.23, 1, 0.32, 1] }
			}
			className="overflow-hidden"
		>
			<div ref={innerRef}>{children}</div>
		</motion.div>
	);
}

/**
 * Auth form card shell — same chrome as the add-contact method card.
 * Outer soft shell + inset white panel; footer sits in the outer shell and
 * always keeps its strip height (content crossfades, never unmounts the bar).
 */
export function AuthCard({
	children,
	footer,
	footerKey = "footer",
	showBrandMark = true,
}: {
	children: ReactNode;
	/** Soft outer-shell footer (e.g. "Already have an account?"). */
	footer?: ReactNode;
	/** Stable key for footer content crossfade between steps. */
	footerKey?: string;
	/** Gray two-layer logo tile above step content (default true). */
	showBrandMark?: boolean;
}) {
	return (
		<div className="w-full font-sans">
			{/* Outer soft shell */}
			<div className="overflow-hidden rounded-[18px] border border-stroke-soft-200 bg-bg-soft-50 dark:border-stroke-soft-100/40">
				{/* White panel height-animates alone */}
				<AnimatedHeight>
					<div className="m-0.5 space-y-6 overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-white-0 px-6 pt-5 pb-6 dark:border-stroke-soft-100/40">
						{showBrandMark ? (
							<div
								className="w-fit overflow-hidden rounded-2xl border border-stroke-soft-200 bg-bg-soft-50 dark:border-stroke-soft-100/40"
								aria-hidden
							>
								<div className="m-px flex size-11 items-center justify-center rounded-[14px] border border-stroke-soft-200 bg-bg-white-0 dark:border-stroke-soft-100/40">
									<Logo className="h-10 w-10" />
								</div>
							</div>
						) : null}

						{children}
					</div>
				</AnimatedHeight>

				{/* Footer strip always mounted — crossfade text, no collapse/pop */}
				{footer != null ? (
					<div className="relative min-h-11 px-6 pt-3 pb-3.5 font-medium text-[13px] text-text-sub-600 dark:bg-bg-weak-50/40">
						<AnimatePresence mode="wait" initial={false}>
							<motion.div
								key={footerKey}
								initial={{ opacity: 0, y: 6 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -6 }}
								transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
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
				className="mt-4 border-stroke-soft-200 border-t border-dashed pb-2 dark:border-stroke-soft-100/40"
				aria-hidden
			/>
		</div>
	);
}
