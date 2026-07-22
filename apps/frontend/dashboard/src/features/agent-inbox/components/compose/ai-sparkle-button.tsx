import { cn } from "@reloop/ui/cn";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { LoadingDot } from "../shared/loading-dot";

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

export const AiSparkleButton = ({
	onClick,
	disabled = false,
	loading = false,
	label,
	title = "AI draft",
	variant = "pill",
	size = "sm",
	className,
}: AiSparkleButtonProps) => {
	return (
		<motion.button
			type="button"
			onClick={onClick}
			disabled={disabled || loading}
			whileHover={disabled || loading ? undefined : { scale: 1.02 }}
			whileTap={disabled || loading ? undefined : { scale: 0.97 }}
			transition={{ type: "spring", stiffness: 400, damping: 25 }}
			title={title}
			className={cn(
				"relative inline-flex items-center justify-center font-medium transition-all duration-200 select-none outline-none",
				"disabled:opacity-40 disabled:pointer-events-none",
				// Apple-style clean monochrome glass pill
				variant === "pill" && [
					"h-7 px-2.5 gap-1.5 rounded-lg text-[12px]",
					"bg-transparent text-mail-muted hover:text-mail-foreground",
					"hover:bg-[var(--inbox-hover)]",
				],
				// Icon-only variant
				variant === "icon" && [
					size === "sm" ? "h-7 w-7 rounded-lg" : "h-8 w-8 rounded-xl",
					"text-mail-muted hover:text-mail-foreground",
					"hover:bg-[var(--inbox-hover)]",
				],
				className,
			)}
		>
			<div className="flex items-center gap-1.5">
				{loading ? (
					<LoadingDot
						label="Generating"
						className="text-mail-foreground"
					/>
				) : (
					<motion.div
						whileHover={{ rotate: 12, scale: 1.1 }}
						transition={{ type: "spring", stiffness: 300, damping: 18 }}
						className="shrink-0"
					>
						<Sparkles className="h-3.5 w-3.5 text-mail-foreground" />
					</motion.div>
				)}

				{(label || variant === "pill") && (
					<span className="text-[12px] font-medium tracking-tight text-mail-foreground/50 hover:text-mail-foreground/80 transition-opacity">
						{loading ? "Generating…" : label || "AI Draft"}
					</span>
				)}
			</div>
		</motion.button>
	);
};
