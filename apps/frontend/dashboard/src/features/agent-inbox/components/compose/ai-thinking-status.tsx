import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { AI_THINK_SHIMMER_MS } from "../../lib/read-ai-text-stream-after-think";
import { LoadingDot } from "../shared/loading-dot";

type ThinkingPhase = "thinking" | "tone" | "writing";

const PHASE_LABEL: Record<ThinkingPhase, string> = {
	thinking: "Thinking…",
	tone: "Writing in your tone…",
	writing: "Writing…",
};

/**
 * animate-text `fade-through`, compressed for inbox density (UI < 300ms).
 * enter: opacity 0 → 1, y 6 → 0, scale 0.99 → 1, blur 2 → 0
 * exit: opacity 1 → 0, y 0 → -4
 */
const FADE_THROUGH_EASE = [0.2, 0, 0, 1] as const;
const FADE_THROUGH_EXIT_EASE = [0.4, 0, 1, 1] as const;

/**
 * One-way Claude-style status with fade-through phrase swaps + shimmer.
 * Thinking → Writing in your tone → Writing (only once streamed text arrives).
 */
export const AiThinkingStatus = ({
	hasStreamText = false,
	className,
}: {
	/** Once tokens arrive, lock to Writing. */
	hasStreamText?: boolean;
	className?: string;
}) => {
	const reduceMotion = useReducedMotion();
	const [phase, setPhase] = useState<ThinkingPhase>("thinking");

	useEffect(() => {
		if (hasStreamText) {
			setPhase("writing");
			return;
		}
		setPhase("thinking");
		if (reduceMotion) {
			setPhase("tone");
			return;
		}
		const id = window.setTimeout(() => {
			setPhase((current) => (current === "writing" ? current : "tone"));
		}, AI_THINK_SHIMMER_MS);
		return () => window.clearTimeout(id);
	}, [hasStreamText, reduceMotion]);

	const label = PHASE_LABEL[phase];

	return (
		<div className={cn("flex min-w-0 items-center gap-2", className)}>
			<LoadingDot
				label={label}
				size={14}
				dotSize={2}
				className="text-mail-foreground"
			/>
			<div className="relative min-h-[1.15em] min-w-0 overflow-hidden">
				<AnimatePresence mode="wait" initial={false}>
					<motion.span
						key={label}
						initial={
							reduceMotion
								? { opacity: 0 }
								: {
										opacity: 0,
										y: 6,
										scale: 0.99,
										filter: "blur(2px)",
									}
						}
						animate={
							reduceMotion
								? { opacity: 1 }
								: {
										opacity: 1,
										y: 0,
										scale: 1,
										filter: "blur(0px)",
									}
						}
						exit={
							reduceMotion
								? { opacity: 0 }
								: {
										opacity: 0,
										y: -4,
										scale: 1,
										filter: "blur(0px)",
									}
						}
						transition={
							reduceMotion
								? { duration: 0.12 }
								: {
										duration: 0.22,
										ease: FADE_THROUGH_EASE,
										opacity: {
											duration: 0.18,
											ease: FADE_THROUGH_EXIT_EASE,
										},
									}
						}
						className={cn(
							"block truncate font-medium text-[12px] tracking-tight",
							"bg-[linear-gradient(110deg,var(--mail-muted)_0%,var(--mail-muted)_35%,var(--mail-foreground)_50%,var(--mail-muted)_65%,var(--mail-muted)_100%)]",
							"bg-[length:220%_100%] bg-clip-text text-transparent",
							!reduceMotion &&
								"animate-[ai-think-shimmer_2.2s_linear_infinite]",
						)}
					>
						{label}
					</motion.span>
				</AnimatePresence>
			</div>
			<style>{`
				@keyframes ai-think-shimmer {
					0% { background-position: 100% 0; }
					100% { background-position: -100% 0; }
				}
			`}</style>
		</div>
	);
};
