"use client";

import { Icon } from "@reloop/ui/icon";
import { MessageAvatar } from "./message-avatar";
import { getBadgeVariant, MessageBadge } from "./message-badge";
import { formatMessageTimestamp } from "./date-utils";

interface MessageHeaderCollapsedProps {
	msg: any;
	isOutbound: boolean;
	isApproval: boolean;
	isAgent: boolean;
	onClick: () => void;
}

/**
 * Collapsed (two-line) row for a thread message card.
 * Shows:
 *  - Line 1: avatar · sender name · badge  |  timestamp · chevron-down
 *  - Line 2: snippet below sender name (indented/aligned)
 */
export const MessageHeaderCollapsed = ({
	msg,
	isOutbound,
	isApproval,
	isAgent,
	onClick,
}: MessageHeaderCollapsedProps) => {
	const senderName = isOutbound
		? "You"
		: msg.fromName || (msg.fromEmail ? msg.fromEmail.split("@")[0] : "Unknown");

	const snippet =
		msg.email?.textBody?.substring(0, 100).replace(/\s+/g, " ") || "";

	return (
		<div
			role="button"
			onClick={onClick}
			className="flex cursor-pointer select-none items-start justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-850/30"
		>
			<div className="flex min-w-0 items-start gap-3">
				<MessageAvatar
					fromEmail={msg.fromEmail || ""}
					fromName={msg.fromName ?? null}
					isOutbound={isOutbound}
					size="md"
				/>
				<div className="flex min-w-0 flex-col gap-0.5 pt-0.5">
					<div className="flex items-center gap-1.5">
						<span className="font-semibold text-sm text-text-strong-950 dark:text-white">
							{senderName}
						</span>
						<MessageBadge
							variant={getBadgeVariant(isApproval, isOutbound, isAgent)}
						/>
					</div>
					<span className="truncate text-text-soft-400 text-xs">{snippet}</span>
				</div>
			</div>

			<div className="flex shrink-0 items-center gap-2 font-medium text-text-soft-400 text-xs pt-1">
				<span>{formatMessageTimestamp(msg.messageAt)}</span>
				<Icon name="chevron-down" className="h-3.5 w-3.5" />
			</div>
		</div>
	);
};

