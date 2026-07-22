import { cn } from "@reloop/ui/cn";
import { KbdKeyOutline } from "@reloop/ui/kbd-key-outline";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { AiThinkingStatus } from "./ai-thinking-status";

const easeOut = [0.16, 1, 0.3, 1] as const;
const MICRO_SCALE_EASE = [0.32, 0.72, 0, 1] as const;

const modKey =
	typeof navigator !== "undefined" &&
	/Mac|iPhone|iPad|iPod/.test(navigator.platform)
		? "⌘"
		: "Ctrl";

/**
 * Single-row strip for AI drafts that stream into the editor.
 * Thinking / streaming: status + Esc.
 * Review: status + Discard / Keep on the same row.
 */
export const AiComposePreview = ({
	loading,
	hasStreamText = false,
	onAccept,
	onReject,
	className,
	compact = false,
}: {
	loading: boolean;
	hasStreamText?: boolean;
	onAccept: () => void;
	onReject: () => void;
	className?: string;
	compact?: boolean;
}) => {
	const reduceMotion = useReducedMotion();
	const ready = !loading;

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.preventDefault();
				event.stopPropagation();
				onReject();
				return;
			}
			if (
				ready &&
				event.key === "Enter" &&
				(event.metaKey || event.ctrlKey)
			) {
				event.preventDefault();
				event.stopPropagation();
				onAccept();
			}
		};
		window.addEventListener("keydown", onKeyDown, true);
		return () => window.removeEventListener("keydown", onKeyDown, true);
	}, [onAccept, onReject, ready]);

	return (
		<motion.section
			role="region"
			aria-label={loading ? "Writing draft" : "Review AI draft"}
			aria-live="polite"
			initial={
				reduceMotion
					? { opacity: 0 }
					: { opacity: 0, transform: "translateY(6px)" }
			}
			animate={
				reduceMotion
					? { opacity: 1 }
					: { opacity: 1, transform: "translateY(0px)" }
			}
			exit={
				reduceMotion
					? { opacity: 0 }
					: { opacity: 0, transform: "translateY(4px)" }
			}
			transition={
				reduceMotion
					? { duration: 0.12 }
					: { duration: 0.2, ease: easeOut }
			}
			className={cn(
				"border-mail-border/40 border-t bg-[var(--inbox-muted-bg)]/55",
				className,
			)}
		>
			<div
				className={cn(
					"flex items-center justify-between gap-3",
					compact ? "h-10 px-4" : "h-11 px-5",
				)}
			>
				{loading ? (
					<AiThinkingStatus hasStreamText={hasStreamText} />
				) : (
					<motion.p
						initial={
							reduceMotion
								? { opacity: 0 }
								: { opacity: 0, scale: 0.98 }
						}
						animate={{ opacity: 1, scale: 1 }}
						transition={
							reduceMotion
								? { duration: 0.12 }
								: { duration: 0.2, ease: MICRO_SCALE_EASE }
						}
						className="min-w-0 truncate text-[12px] text-mail-muted"
					>
						<span className="font-medium text-mail-foreground">
							AI draft
						</span>
						<span className="text-mail-muted/70"> · </span>
						<span>Replace previous text?</span>
					</motion.p>
				)}

				{loading ? (
					<button
						type="button"
						onClick={onReject}
						className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-2 text-[11px] text-mail-muted transition-[color,background-color,transform] duration-150 ease-out hover:bg-[var(--inbox-hover)] hover:text-mail-foreground active:scale-[0.97]"
					>
						Cancel
						<KbdKeyOutline className="h-3.5 min-w-3.5 font-sans text-[8px]">
							Esc
						</KbdKeyOutline>
					</button>
				) : (
					<motion.div
						initial={
							reduceMotion
								? { opacity: 0 }
								: { opacity: 0, scale: 0.96 }
						}
						animate={{ opacity: 1, scale: 1 }}
						transition={
							reduceMotion
								? { duration: 0.12 }
								: { duration: 0.2, ease: MICRO_SCALE_EASE }
						}
						className="flex shrink-0 items-center gap-1.5"
					>
						<button
							type="button"
							onClick={onReject}
							className="inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 font-medium text-[12px] text-mail-muted transition-[color,background-color,transform] duration-150 ease-out hover:bg-[var(--inbox-hover)] hover:text-mail-foreground active:scale-[0.97]"
						>
							Discard
							<KbdKeyOutline className="h-3.5 min-w-3.5 font-sans text-[8px]">
								Esc
							</KbdKeyOutline>
						</button>
						<button
							type="button"
							onClick={onAccept}
							className="inline-flex h-7 items-center gap-1.5 rounded-md bg-mail-foreground px-2.5 font-medium text-[12px] text-mail-background transition-[opacity,transform] duration-150 ease-out hover:opacity-90 active:scale-[0.97]"
						>
							Keep
							<span className="flex items-center gap-0.5 opacity-70">
								<KbdKeyOutline className="h-3.5 w-3.5 border-mail-background/25 font-sans text-[8px] text-mail-background">
									{modKey === "⌘" ? "⌘" : "⌃"}
								</KbdKeyOutline>
								<KbdKeyOutline className="h-3.5 w-3.5 border-mail-background/25 font-sans text-[8px] text-mail-background">
									↵
								</KbdKeyOutline>
							</span>
						</button>
					</motion.div>
				)}
			</div>
		</motion.section>
	);
};
