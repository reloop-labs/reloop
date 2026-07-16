import { cn } from "@reloop/ui/cn";
import { Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { InboundThread } from "../types";

export const useAiSidebar = () => {
	const [open, setOpen] = useState(false);
	return {
		open,
		setOpen,
		toggle: () => setOpen((v) => !v),
	};
};

export const AiSidebar = ({
	open,
	onClose,
	thread,
}: {
	open: boolean;
	onClose: () => void;
	thread: InboundThread | null;
}) => {
	const suggestions = useMemo(() => {
		if (!thread) {
			return [
				"Summarize my unread inbox",
				"Draft a polite follow-up",
				"Find threads that need approval",
			];
		}
		return [
			`Summarize: ${thread.subject}`,
			"Draft a reply in a professional tone",
			"Extract action items from this thread",
			"Suggest whether to archive or escalate",
		];
	}, [thread]);

	if (!open) return null;

	return (
		<aside
			className={cn(
				"mb-1 flex h-full w-[min(320px,100%)] shrink-0 flex-col overflow-hidden rounded-2xl border border-mail-border bg-panel-light shadow-sm dark:bg-panel-dark",
			)}
		>
			<div className="flex items-center justify-between border-mail-border border-b px-3 py-2.5">
				<div className="flex items-center gap-2">
					<Sparkles className="h-3.5 w-3.5 text-amber-400" />
					<span className="font-medium text-mail-foreground text-sm">
						Agent assist
					</span>
				</div>
				<button
					type="button"
					onClick={onClose}
					className="rounded-md p-1 text-mail-muted hover:bg-[var(--inbox-control-hover)]"
					aria-label="Close AI sidebar"
				>
					<X className="h-3.5 w-3.5" />
				</button>
			</div>

			<div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
				{thread ? (
					<div className="rounded-lg border border-mail-border bg-[var(--inbox-muted-bg)] p-3">
						<p className="mb-1 text-[10px] text-mail-muted uppercase tracking-wide">
							Current thread
						</p>
						<p className="line-clamp-2 font-medium text-mail-foreground text-xs">
							{thread.subject}
						</p>
						<p className="mt-1 line-clamp-3 text-[11px] text-mail-muted">
							{thread.preview}
						</p>
					</div>
				) : (
					<p className="text-mail-muted text-xs">
						Select a thread for context-aware suggestions, or ask about your
						inbox.
					</p>
				)}

				<div className="space-y-1.5">
					<p className="text-[10px] text-mail-muted uppercase tracking-wide">
						Suggestions
					</p>
					{suggestions.map((s) => (
						<button
							key={s}
							type="button"
							className="w-full rounded-lg border border-mail-border bg-[var(--inbox-control)] px-2.5 py-2 text-left text-mail-foreground text-xs transition-colors hover:bg-[var(--inbox-control-hover)]"
						>
							{s}
						</button>
					))}
				</div>

				<div className="mt-auto rounded-lg border border-mail-border/60 border-dashed p-3 text-[11px] text-mail-muted">
					Agent assist uses Reloop inbox context. Wire your agent runtime here
					to stream answers for the selected thread.
				</div>
			</div>
		</aside>
	);
};

export const AiSidebarToggle = ({
	onClick,
	active,
}: {
	onClick: () => void;
	active?: boolean;
}) => (
	<button
		type="button"
		onClick={onClick}
		className={cn(
			"inline-flex h-7 items-center justify-center gap-1 overflow-hidden rounded-lg border-none bg-[var(--inbox-control)] px-2 transition-colors hover:bg-[var(--inbox-control-hover)]",
			active && "ring-1 ring-amber-400/40",
		)}
	>
		<Sparkles className="mr-1 h-3.5 w-3.5 fill-[#959595]" />
		<span className="text-mail-foreground text-sm leading-none">
			Agent chat
		</span>
	</button>
);
