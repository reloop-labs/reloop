import { cn } from "@reloop/ui/cn";
import { motion, useReducedMotion } from "framer-motion";
import { Undo2 } from "lucide-react";
import { useEffect } from "react";
import { AiStopButton } from "./ai-stop-button";
import { AiThinkingStatus } from "./ai-thinking-status";

const MICRO_SCALE_EASE = [0.32, 0.72, 0, 1] as const;

/**
 * Lives in the sparkle-button slot — never beside Send/Cancel.
 *
 * thinking/streaming → status + circular stop
 * review → Undo (Esc still restores; no Esc chrome while generating)
 */
export const AiComposerSlot = ({
	loading,
	hasStreamText = false,
	onUndo,
	className,
}: {
	loading: boolean;
	hasStreamText?: boolean;
	onUndo: () => void;
	className?: string;
}) => {
	const reduceMotion = useReducedMotion();

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "Escape") return;
			event.preventDefault();
			event.stopPropagation();
			onUndo();
		};
		window.addEventListener("keydown", onKeyDown, true);
		return () => window.removeEventListener("keydown", onKeyDown, true);
	}, [onUndo]);

	if (loading) {
		return (
			<div
				className={cn(
					"flex min-w-0 max-w-full items-center gap-2.5",
					className,
				)}
			>
				<AiThinkingStatus hasStreamText={hasStreamText} className="min-w-0" />
				<AiStopButton onClick={onUndo} />
			</div>
		);
	}

	return (
		<motion.button
			type="button"
			onClick={onUndo}
			initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={
				reduceMotion
					? { duration: 0.12 }
					: { duration: 0.2, ease: MICRO_SCALE_EASE }
			}
			className={cn(
				"inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border border-mail-border/60 bg-[var(--inbox-muted-bg)] px-2.5 font-medium text-[12px] text-mail-muted transition-[color,background-color,border-color,transform] duration-150 ease-out hover:border-mail-border hover:bg-[var(--inbox-hover)] hover:text-mail-foreground active:scale-[0.97]",
				className,
			)}
			title="Restore the text from before AI"
		>
			<Undo2 className="h-3.5 w-3.5" strokeWidth={2} />
			<span>Undo</span>
		</motion.button>
	);
};
