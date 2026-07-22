import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { FilePenLine } from "lucide-react";
import type { ComposeDraft } from "../../types";

function draftPreview(draft: ComposeDraft) {
	const raw = (draft.text || draft.html.replace(/<[^>]+>/g, " "))
		.replace(/\s+/g, " ")
		.trim();
	if (!raw) return "Empty draft";
	return raw.length > 100 ? `${raw.slice(0, 100)}…` : raw;
}

export const ThreadSavedDraftBar = ({
	draft,
	onContinue,
	onDiscard,
	className,
}: {
	draft: ComposeDraft;
	onContinue: () => void;
	onDiscard: () => void;
	className?: string;
}) => {
	return (
		<div
			className={cn(
				"mx-4 mb-3 flex items-center gap-3 rounded-2xl border border-mail-border/50 bg-panel-light px-3.5 py-2.5 shadow-sm dark:bg-panel-dark",
				className,
			)}
		>
			<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--inbox-muted-bg)] text-mail-foreground">
				<FilePenLine className="h-3.5 w-3.5" />
			</div>
			<button
				type="button"
				onClick={onContinue}
				className="min-w-0 flex-1 text-left"
			>
				<p className="font-medium text-[12px] text-mail-foreground">
					Draft
					<span className="ml-1.5 font-normal text-mail-muted">
						· click to continue
					</span>
				</p>
				<p className="mt-0.5 truncate text-[12px] text-mail-muted">
					{draftPreview(draft)}
				</p>
			</button>
			<button
				type="button"
				onClick={onDiscard}
				className="inline-flex h-7 shrink-0 items-center rounded-lg px-2.5 font-medium text-[12px] text-mail-muted transition-colors duration-150 hover:bg-[var(--inbox-danger-bg)] hover:text-[var(--inbox-danger-fg)]"
			>
				Discard
			</button>
			<button
				type="button"
				onClick={onContinue}
				className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg bg-mail-foreground px-2.5 font-medium text-[12px] text-mail-background transition-opacity duration-150 hover:opacity-90"
			>
				<Icon name="reply" className="h-3 w-3" />
				Continue
			</button>
		</div>
	);
};
