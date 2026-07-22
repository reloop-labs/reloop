import { cn } from "@reloop/ui/cn";
import { KbdKeyOutline } from "@reloop/ui/kbd-key-outline";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { AiThinkingStatus } from "./ai-thinking-status";

const easeOut = [0.16, 1, 0.3, 1] as const;

const modKey =
	typeof navigator !== "undefined" &&
	/Mac|iPhone|iPad|iPod/.test(navigator.platform)
		? "⌘"
		: "Ctrl";

export const AiComposePreview = ({
	text,
	loading,
	onAccept,
	onReject,
	className,
	/** Shorter chrome for the inline reply composer. */
	compact = false,
}: {
	/** Plain-text draft (grows while streaming). */
	text: string | null;
	loading: boolean;
	onAccept: () => void;
	onReject: () => void;
	className?: string;
	compact?: boolean;
}) => {
	const reduceMotion = useReducedMotion();
	const hasText = Boolean(text?.trim());
	const ready = !loading && hasText;
	const draftScrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!hasText || !draftScrollRef.current) return;
		draftScrollRef.current.scrollTop = draftScrollRef.current.scrollHeight;
	}, [text, hasText]);

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
			aria-label={loading ? "Thinking" : "Suggested draft"}
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
					compact ? "px-4 py-2.5" : "px-5 py-3",
					hasText && (compact ? "pb-1.5" : "pb-2"),
				)}
			>
				{loading ? (
					<AiThinkingStatus hasStreamText={hasText} />
				) : (
					<div className="flex min-w-0 items-center gap-2">
						<span className="font-medium text-[11px] text-mail-muted uppercase tracking-[0.06em]">
							Suggestion
						</span>
						<span className="truncate text-[12px] text-mail-muted/80">
							Review, then use it in the editor
						</span>
					</div>
				)}
				<button
					type="button"
					onClick={onReject}
					className="shrink-0 rounded-md px-1.5 py-0.5 text-[11px] text-mail-muted transition-colors duration-150 hover:bg-[var(--inbox-hover)] hover:text-mail-foreground"
				>
					Esc
				</button>
			</div>

			{hasText ? (
				<div className={cn(compact ? "px-4 pb-3" : "px-5 pb-3")}>
					<div
						ref={draftScrollRef}
						className="max-h-[220px] overflow-y-auto whitespace-pre-wrap text-[13px] leading-[1.55] text-mail-foreground"
					>
						{text}
						{loading ? (
							<span
								aria-hidden
								className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-mail-foreground/70 align-baseline"
							/>
						) : null}
					</div>
				</div>
			) : null}

			{ready ? (
				<div
					className={cn(
						"flex items-center justify-end gap-2 border-mail-border/30 border-t",
						compact ? "px-4 py-2" : "px-5 py-2.5",
					)}
				>
					<button
						type="button"
						onClick={onReject}
						className="inline-flex h-7 items-center rounded-md px-2.5 font-medium text-[12px] text-mail-muted transition-[color,background-color,transform] duration-150 ease-out hover:bg-[var(--inbox-hover)] hover:text-mail-foreground active:scale-[0.97]"
					>
						Discard
					</button>
					<button
						type="button"
						onClick={onAccept}
						className="inline-flex h-7 items-center gap-1.5 rounded-md bg-mail-foreground px-2.5 font-medium text-[12px] text-mail-background transition-[opacity,transform] duration-150 ease-out hover:opacity-90 active:scale-[0.97]"
					>
						<span>Use draft</span>
						<span className="flex items-center gap-0.5 opacity-70">
							<KbdKeyOutline className="h-3.5 w-3.5 border-mail-background/25 font-sans text-[8px] text-mail-background">
								{modKey === "⌘" ? "⌘" : "⌃"}
							</KbdKeyOutline>
							<KbdKeyOutline className="h-3.5 w-3.5 border-mail-background/25 font-sans text-[8px] text-mail-background">
								↵
							</KbdKeyOutline>
						</span>
					</button>
				</div>
			) : null}
		</motion.section>
	);
};
