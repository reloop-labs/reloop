import { cn } from "@reloop/ui/cn";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Sparkles, X } from "lucide-react";
import { LoadingDot } from "../shared/loading-dot";

export const AiComposePreview = ({
	html,
	loading,
	onAccept,
	onReject,
}: {
	html: string | null;
	loading: boolean;
	onAccept: () => void;
	onReject: () => void;
}) => {
	const shouldReduceMotion = useReducedMotion();

	return (
		<motion.div
			initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
			animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
			exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
			transition={
				shouldReduceMotion
					? { duration: 0.15 }
					: { duration: 0.22, ease: [0.16, 1, 0.3, 1] }
			}
			className="mt-2 mx-5 mb-3 rounded-xl border border-mail-border/30 bg-[var(--inbox-hover)]/30 backdrop-blur-md overflow-hidden"
		>
			{/* Header */}
			<div className="flex items-center justify-between px-3.5 pt-3 pb-2 border-b border-mail-border/20">
				<div className="flex items-center gap-2">
					<Sparkles className="h-3.5 w-3.5 text-mail-foreground/70" />
					<span className="font-semibold text-[12px] text-mail-foreground tracking-tight">
						AI Draft
					</span>
					{loading && (
						<div className="flex items-center gap-1.5 text-[11px] text-mail-foreground pl-1">
							<LoadingDot label="Generating" />
							<span className="opacity-50">Generating…</span>
						</div>
					)}
				</div>
				<button
					type="button"
					onClick={onReject}
					className="flex items-center justify-center w-5 h-5 rounded text-mail-muted hover:text-mail-foreground hover:bg-[var(--inbox-hover)] transition-colors"
					aria-label="Dismiss"
				>
					<X className="h-3 w-3" />
				</button>
			</div>

			{/* Content Body */}
			<div className="px-3.5 py-3 text-[13px] leading-relaxed text-mail-foreground">
				<AnimatePresence mode="wait">
					{loading ? (
						<div className="space-y-2 py-1">
							<div className="h-3 w-[90%] animate-pulse rounded bg-mail-border/40" />
							<div className="h-3 w-[98%] animate-pulse rounded bg-mail-border/40" />
							<div className="h-3 w-[75%] animate-pulse rounded bg-mail-border/40" />
						</div>
					) : (
						<motion.div
							key="content"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.15 }}
							className={cn(
								"max-h-48 overflow-y-auto text-[13px] leading-relaxed text-mail-foreground",
								"prose prose-sm dark:prose-invert max-w-none",
								"[&>p]:my-1.5 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0",
							)}
							// biome-ignore lint/security/noDangerouslySetInnerHtml: AI preview HTML
							dangerouslySetInnerHTML={{ __html: html || "" }}
						/>
					)}
				</AnimatePresence>
			</div>

			{/* Footer Actions */}
			{!loading && html && (
				<div className="flex items-center justify-between px-3.5 py-2.5 bg-[var(--inbox-hover)]/40 border-t border-mail-border/40">
					<span className="text-[11px] text-mail-muted">
						Review and accept to replace editor content
					</span>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={onReject}
							className="rounded-lg px-2.5 py-1 text-[12px] font-medium text-mail-muted hover:text-mail-foreground hover:bg-[var(--inbox-hover)] transition-colors"
						>
							Discard
						</button>
						<button
							type="button"
							onClick={onAccept}
							className="inline-flex items-center gap-1.5 rounded-lg bg-mail-foreground text-mail-background px-3 py-1 text-[12px] font-semibold hover:opacity-90 transition-opacity"
						>
							<Check className="h-3 w-3" />
							Accept
						</button>
					</div>
				</div>
			)}
		</motion.div>
	);
};
