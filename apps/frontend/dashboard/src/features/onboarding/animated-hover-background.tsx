import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion } from "framer-motion";

interface AnimatedHoverBackgroundProps {
	rect: DOMRect | undefined;
	tabElement: HTMLElement | undefined;
	className?: string;
	isDanger?: boolean;
}

export function AnimatedHoverBackground({
	rect,
	tabElement,
	className,
	isDanger = false,
}: AnimatedHoverBackgroundProps) {
	const left = tabElement?.offsetLeft ?? 0;
	const top = tabElement?.offsetTop ?? 0;

	return (
		<AnimatePresence>
			{rect && tabElement && (
				<motion.div
					className={cn(
						"absolute top-0 left-0 rounded-lg",
						isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10",
						className,
					)}
					// Avoid opacity 0→1 on every remount/remeasure — that flash
					// showed up as sidebar text flicker when inbox data refreshed.
					initial={false}
					animate={{
						pointerEvents: "none",
						width: rect.width,
						height: rect.height,
						left,
						top,
						opacity: 1,
					}}
					exit={{
						pointerEvents: "none",
						opacity: 0,
						width: rect.width,
						height: rect.height,
						left,
						top,
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
