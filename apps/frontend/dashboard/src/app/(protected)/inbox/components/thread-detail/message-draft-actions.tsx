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
		<div className="mx-5 mb-5 flex items-center gap-2.5 border-t border-stroke-soft-100/60 pt-4 dark:border-stroke-soft-100/10">
			{/* Primary: Approve & send */}
			<button
				type="button"
				onClick={onApproveSend}
				className="flex items-center gap-2 rounded-xl bg-text-strong-950 px-4 py-2.5 font-semibold text-white text-xs shadow-sm transition-all hover:opacity-85 dark:bg-white dark:text-neutral-900"
			>
				<Icon name="send" className="h-3.5 w-3.5" />
				<span>Approve &amp; send</span>
			</button>

			{/* Secondary: Edit reply */}
			<button
				type="button"
				onClick={onEditReply}
				className="flex items-center gap-2 rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-4 py-2.5 font-semibold text-text-sub-600 text-xs transition-all hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-stroke-soft-100/30 dark:bg-neutral-800/20"
			>
				<Icon name="edit" className="h-3.5 w-3.5" />
				<span>Edit reply</span>
			</button>

			{/* Secondary: Forward */}
			<button
				type="button"
				onClick={onForward}
				className="flex items-center gap-2 rounded-xl border border-stroke-soft-100 bg-bg-white-0 px-4 py-2.5 font-semibold text-text-sub-600 text-xs transition-all hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-stroke-soft-100/30 dark:bg-neutral-800/20"
			>
				<Icon name="forward" className="h-3.5 w-3.5" />
				<span>Forward</span>
			</button>
		</div>
	);
};
