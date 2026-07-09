"use client";

import { cn } from "@reloop/ui/cn";
import { Loader2, Sparkles, X } from "lucide-react";

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
	if (!loading && !html) return null;

	return (
		<div className="absolute inset-x-3 bottom-3 z-20 rounded-xl border border-violet-500/40 bg-panel-light/95 p-3 shadow-lg backdrop-blur dark:bg-[#202020]/95">
			<div className="mb-2 flex items-center justify-between">
				<div className="flex items-center gap-1.5 text-violet-400 text-xs font-medium">
					<Sparkles className="h-3.5 w-3.5" />
					AI draft
				</div>
				<button
					type="button"
					onClick={onReject}
					className="rounded p-1 text-mail-muted hover:bg-[var(--inbox-hover)]"
					aria-label="Reject"
				>
					<X className="h-3.5 w-3.5" />
				</button>
			</div>
			{loading ? (
				<div className="flex items-center gap-2 py-4 text-mail-muted text-sm">
					<Loader2 className="h-4 w-4 animate-spin" />
					Generating…
				</div>
			) : (
				<div
					className={cn(
						"max-h-40 overflow-y-auto rounded-md border border-mail-border/50 bg-white/50 p-2 text-sm dark:bg-black/20",
						"prose prose-sm dark:prose-invert max-w-none",
					)}
					// biome-ignore lint/security/noDangerouslySetInnerHtml: AI preview HTML
					dangerouslySetInnerHTML={{ __html: html || "" }}
				/>
			)}
			{!loading && html && (
				<div className="mt-2 flex justify-end gap-2">
					<button
						type="button"
						onClick={onReject}
						className="rounded-md px-2.5 py-1 text-mail-muted text-xs hover:bg-[var(--inbox-hover)]"
					>
						Reject
					</button>
					<button
						type="button"
						onClick={onAccept}
						className="rounded-md bg-violet-600 px-2.5 py-1 text-white text-xs hover:bg-violet-500"
					>
						Accept
					</button>
				</div>
			)}
		</div>
	);
};
