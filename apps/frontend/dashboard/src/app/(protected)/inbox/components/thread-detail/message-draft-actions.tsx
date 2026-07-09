"use client";

import { Icon } from "@reloop/ui/icon";

interface MessageDraftActionsProps {
	onApproveSend: () => void;
	onEditReply: () => void;
	onForward: () => void;
}

/**
 * Three-button action bar shown at the bottom of approval-pending cards.
 * Matches screenshot: [Approve & send] [Edit reply] [Forward]
 */
export const MessageDraftActions = ({
	onApproveSend,
	onEditReply,
	onForward,
}: MessageDraftActionsProps) => {
	return (
		<div className="mb-1 flex w-full items-center gap-2.5 pt-1">
			{/* Primary: Approve & send */}
			<button
				type="button"
				onClick={onApproveSend}
				className="flex items-center gap-2 rounded-xl bg-mail-primary bg-mail-primary px-4 py-2.5 font-semibold text-panel-light text-xs shadow-sm transition-all hover:opacity-85 dark:text-panel-light"
			>
				<Icon name="send" className="h-3.5 w-3.5" />
				<span>Approve &amp; send</span>
			</button>

			{/* Secondary: Edit reply */}
			<button
				type="button"
				onClick={onEditReply}
				className="flex items-center gap-2 rounded-xl border border-mail-border border-mail-border/30 bg-mail-accent/20 bg-panel-light px-4 py-2.5 font-semibold text-mail-muted text-xs transition-all hover:bg-offset-light hover:text-mail-foreground"
			>
				<Icon name="reply" className="h-3.5 w-3.5" />
				<span>Edit reply</span>
			</button>

			{/* Secondary: Forward */}
			<button
				type="button"
				onClick={onForward}
				className="flex items-center gap-2 rounded-xl border border-mail-border border-mail-border/30 bg-mail-accent/20 bg-panel-light px-4 py-2.5 font-semibold text-mail-muted text-xs transition-all hover:bg-offset-light hover:text-mail-foreground"
			>
				<Icon name="forward" className="h-3.5 w-3.5" />
				<span>Forward</span>
			</button>
		</div>
	);
};
