import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion } from "framer-motion";

export type HoverBox = {
	left: number;
	top: number;
	width: number;
	height: number;
};

interface AnimatedHoverBackgroundProps {
	/**
	 * Pre-measured box in the coordinate space of the relative parent.
	 * Prefer this when the parent tracks layout (collapse, resize, scroll).
	 */
	box?: HoverBox | null;
	/** @deprecated Prefer `box` — kept for flat dropdown lists. */
	rect?: DOMRect | undefined;
	/** @deprecated Prefer `box` — kept for flat dropdown lists. */
	tabElement?: HTMLElement | undefined;
	/** @deprecated Prefer `box` — kept for flat dropdown lists. */
	containerElement?: HTMLElement | null;
	className?: string;
	isDanger?: boolean;
}

function resolveBox({
	box,
	rect,
	tabElement,
	containerElement,
}: Pick<
	AnimatedHoverBackgroundProps,
	"box" | "rect" | "tabElement" | "containerElement"
>): HoverBox | null {
	if (box && box.width > 0 && box.height > 0) return box;

	if (tabElement && containerElement) {
		const tabRect = tabElement.getBoundingClientRect();
		const containerRect = containerElement.getBoundingClientRect();
		return {
			left: tabRect.left - containerRect.left + containerElement.scrollLeft,
			top: tabRect.top - containerRect.top + containerElement.scrollTop,
			width: tabRect.width,
			height: tabRect.height,
		};
	}

	if (tabElement && rect) {
		return {
			left: tabElement.offsetLeft,
			top: tabElement.offsetTop,
			width: rect.width,
			height: rect.height,
		};
	}

	return null;
}

/**
 * Sliding hover highlight.
 *
 * For sidebars (nested items, collapse, transforms), pass a pre-measured `box`
 * from the parent. Flat dropdown lists can keep using rect + tabElement.
 */
export function AnimatedHoverBackground({
	box,
	rect,
	tabElement,
	containerElement,
	className,
	isDanger = false,
}: AnimatedHoverBackgroundProps) {
	const resolved = resolveBox({ box, rect, tabElement, containerElement });

	return (
		<AnimatePresence>
			{resolved ? (
				<motion.div
					className={cn(
						"pointer-events-none absolute top-0 left-0 z-0 rounded-lg",
						isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10",
						className,
					)}
					// Avoid opacity 0→1 on every remount/remeasure — that flash
					// showed up as sidebar text flicker when inbox data refreshed.
					initial={false}
					animate={{
						width: resolved.width,
						height: resolved.height,
						left: resolved.left,
						top: resolved.top,
						opacity: 1,
					}}
					exit={{
						opacity: 0,
						width: resolved.width,
						height: resolved.height,
						left: resolved.left,
						top: resolved.top,
					}}
					transition={{
						type: "spring",
						bounce: 0,
						duration: 0.2,
					}}
				/>
			) : null}
		</AnimatePresence>
	);
}
