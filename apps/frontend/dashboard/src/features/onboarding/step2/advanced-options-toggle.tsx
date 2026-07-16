import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

export function AdvancedOptionsToggle({
	open,
	onToggle,
	children,
}: {
	open: boolean;
	onToggle: () => void;
	children: ReactNode;
}) {
	return (
		<div className="mt-2 w-full">
			<button
				type="button"
				onClick={onToggle}
				className="flex w-full cursor-pointer items-center gap-1.5 py-1 outline-none"
			>
				<span className="font-medium text-sm text-text-strong-950">
					Advanced options
				</span>
				<Icon
					name="chevron-down"
					className={cn(
						"size-4 shrink-0 text-text-sub-600 transition-transform duration-200",
						open && "rotate-180",
					)}
				/>
			</button>
			<AnimatePresence initial={false}>
				{open && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
						className="overflow-hidden"
					>
						<div className="my-2 rounded-2xl border border-stroke-soft-100 bg-bg-weak-50/50 p-4">
							{children}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
