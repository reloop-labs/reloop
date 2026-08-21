import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { motion, useReducedMotion } from "framer-motion";

interface AiSparkleButtonProps {
	onClick: () => void;
	disabled?: boolean;
	loading?: boolean;
	label?: string;
	title?: string;
	variant?: "icon" | "pill";
	size?: "sm" | "md";
	className?: string;
}

/**
 * Quiet composer action to request an AI draft.
 * Loading state is shown in the preview panel — this button stays magic-wand + label only.
 */
export const AiSparkleButton = ({
	onClick,
	disabled = false,
	loading = false,
	label = "Write with AI",
	title = "Write with AI",
	variant = "pill",
	size = "sm",
	className,
}: AiSparkleButtonProps) => {
	const reduceMotion = useReducedMotion();
	const idle = disabled || loading;

	return (
		<motion.button
			type="button"
			onClick={onClick}
			disabled={idle}
			whileTap={idle || reduceMotion ? undefined : { scale: 0.97 }}
			transition={{ type: "spring", stiffness: 500, damping: 32 }}
			title={title}
			aria-busy={loading}
			className={cn(
				"relative inline-flex select-none items-center justify-center font-medium outline-none",
				"text-mail-muted transition-[color,background-color,opacity] duration-150 ease-out",
				"hover:bg-[var(--inbox-hover)] hover:text-mail-foreground",
				"focus-visible:ring-2 focus-visible:ring-mail-foreground/20",
				"disabled:pointer-events-none disabled:opacity-40",
				variant === "pill" && ["h-7 gap-1.5 rounded-md px-2 text-[12px]"],
				variant === "icon" && [
					size === "sm" ? "h-7 w-7 rounded-md" : "h-8 w-8 rounded-lg",
				],
				className,
			)}
		>
			<span className="flex items-center gap-1.5 tracking-tight">
				<Icon
					name="magic-wand"
					className="h-3.5 w-3.5 shrink-0 text-mail-foreground/70"
				/>
				{variant === "pill" ? (
					<span className="text-mail-foreground/70">{label}</span>
				) : null}
			</span>
		</motion.button>
	);
};
