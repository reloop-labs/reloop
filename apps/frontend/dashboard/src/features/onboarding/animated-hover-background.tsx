import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion } from "framer-motion";
import { useLayoutEffect, useState } from "react";

interface AnimatedHoverBackgroundProps {
	/** Viewport rect of the hovered item (optional if tabElement + container provided) */
	rect?: DOMRect | undefined;
	/** The hovered DOM node */
	tabElement: HTMLElement | undefined;
	/**
	 * Position measurements relative to this container (must be position:relative).
	 * Prefer this over offsetLeft/offsetTop — more reliable inside scroll/portaled lists.
	 */
	container?: HTMLElement | null;
	className?: string;
	isDanger?: boolean;
}

type HoverBox = {
	width: number;
	height: number;
	left: number;
	top: number;
};

function measureBox(
	tabElement: HTMLElement,
	container?: HTMLElement | null,
	rect?: DOMRect,
): HoverBox {
	if (container) {
		const cr = container.getBoundingClientRect();
		const ir = tabElement.getBoundingClientRect();
		return {
			width: ir.width,
			height: ir.height,
			left: ir.left - cr.left + container.scrollLeft,
			top: ir.top - cr.top + container.scrollTop,
		};
	}

	return {
		width: rect?.width ?? tabElement.offsetWidth,
		height: rect?.height ?? tabElement.offsetHeight,
		left: tabElement.offsetLeft,
		top: tabElement.offsetTop,
	};
}

export function AnimatedHoverBackground({
	rect,
	tabElement,
	container,
	className,
	isDanger = false,
}: AnimatedHoverBackgroundProps) {
	const [box, setBox] = useState<HoverBox | null>(null);

	useLayoutEffect(() => {
		if (!tabElement) {
			setBox(null);
			return;
		}
		setBox(measureBox(tabElement, container, rect));
	}, [tabElement, container, rect?.width, rect?.height, rect?.top, rect?.left]);

	return (
		<AnimatePresence>
			{box && tabElement && (
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
						width: box.width,
						height: box.height,
						left: box.left,
						top: box.top,
						opacity: 1,
					}}
					exit={{
						opacity: 0,
						width: box.width,
						height: box.height,
						left: box.left,
						top: box.top,
					}}
					transition={{
						type: "spring",
						bounce: 0,
						duration: 0.2,
					}}
				/>
			)}
		</AnimatePresence>
	);
}
