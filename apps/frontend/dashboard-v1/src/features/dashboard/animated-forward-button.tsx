import { cn } from "@reloop/ui/cn";
import { motion } from "framer-motion";
import { useState } from "react";

interface AnimatedForwardButtonProps {
	label?: string;
	onClick?: () => void;
	className?: string;
}

const easing = [0.4, 0, 0.2, 1] as const;
const transition = { duration: 0.22, ease: easing };

export function AnimatedForwardButton({
	label = "All plans",
	onClick,
	className,
}: AnimatedForwardButtonProps) {
	const [hovered, setHovered] = useState(false);

	return (
		<motion.button
			type="button"
			onClick={onClick}
			onHoverStart={() => setHovered(true)}
			onHoverEnd={() => setHovered(false)}
			whileTap={{ scale: 0.96 }}
			className={cn(
				"flex cursor-pointer items-center gap-0.5 py-1.5 font-medium text-text-sub-600 text-xs transition-colors duration-200 hover:text-text-strong-950",
				className,
			)}
		>
			<motion.span
				animate={{ letterSpacing: hovered ? "0.02em" : "0em" }}
				transition={transition}
			>
				{label}
			</motion.span>

			<div className="relative flex h-3 w-3 items-center justify-end">
				<motion.div
					className="-translate-y-1/2 absolute top-1/2 right-[1.25px] h-[1.5px] rounded-full bg-current"
					initial={{ width: 0, opacity: 0 }}
					animate={{
						width: hovered ? 8 : 0,
						opacity: hovered ? 1 : 0,
					}}
					transition={transition}
				/>
				<motion.svg
					width={5}
					height={8}
					viewBox="0 0 6 10"
					fill="none"
					className="absolute right-0"
					transition={transition}
					aria-hidden
				>
					<path
						d="M1 1L4.5 5L1 9"
						stroke="currentColor"
						strokeWidth={1.5}
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</motion.svg>
			</div>
		</motion.button>
	);
}
