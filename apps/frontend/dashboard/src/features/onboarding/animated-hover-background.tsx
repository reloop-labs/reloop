import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion } from "framer-motion";

interface AnimatedHoverBackgroundProps {
	/** Viewport rect of the hovered item — used for width/height (fallback). */
	rect: DOMRect | undefined;
	/** The hovered DOM node — used for positioning. */
	tabElement: HTMLElement | undefined;
	/**
	 * The `position: relative` container that hosts this absolute highlight.
	 * When set, position/size are measured with getBoundingClientRect relative
	 * to this element (correct under nested flex, transforms, and collapse).
	 * Falls back to offsetLeft/offsetTop when omitted.
	 */
	containerElement?: HTMLElement | null;
	className?: string;
	isDanger?: boolean;
}

function measureInContainer(
	tab: HTMLElement,
	container: HTMLElement,
): { left: number; top: number; width: number; height: number } {
	const tabRect = tab.getBoundingClientRect();
	const containerRect = container.getBoundingClientRect();
	return {
		left: tabRect.left - containerRect.left + container.scrollLeft,
		top: tabRect.top - containerRect.top + container.scrollTop,
		width: tabRect.width,
		height: tabRect.height,
	};
}

/**
 * Sliding hover highlight.
 *
 * Prefer passing `containerElement` (the relative parent) so position is
 * measured in that coordinate space. Without it, falls back to offsetLeft /
 * offsetTop (works for flat lists where offsetParent is the relative parent).
 */
export function AnimatedHoverBackground({
	rect,
	tabElement,
	containerElement,
	className,
	isDanger = false,
}: AnimatedHoverBackgroundProps) {
	let left = tabElement?.offsetLeft ?? 0;
	let top = tabElement?.offsetTop ?? 0;
	let width = rect?.width ?? 0;
	let height = rect?.height ?? 0;

	if (tabElement && containerElement) {
		const m = measureInContainer(tabElement, containerElement);
		left = m.left;
		top = m.top;
		width = m.width;
		height = m.height;
	}

	const ready = Boolean(rect && tabElement && width > 0 && height > 0);

	return (
		<AnimatePresence>
			{ready ? (
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
						width,
						height,
						left,
						top,
						opacity: 1,
					}}
					exit={{
						opacity: 0,
						width,
						height,
						left,
						top,
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
