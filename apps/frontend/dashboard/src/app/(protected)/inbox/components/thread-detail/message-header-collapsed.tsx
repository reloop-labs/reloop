"use client";

import { Icon } from "@reloop/ui/icon";
import dayjs from "dayjs";
import { MessageAvatar } from "./message-avatar";
import { getBadgeVariant, MessageBadge } from "./message-badge";

interface MessageHeaderCollapsedProps {
	msg: any;
	isOutbound: boolean;
	isApproval: boolean;
	isAgent: boolean;
	onClick: () => void;
}

/**
 * Collapsed (single-line) row for a thread message card.
 * Shows: avatar · sender name · badge · snippet · timestamp · chevron-down
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
		msg.email?.textBody?.substring(0, 80).replace(/\s+/g, " ") || "";

	return (
		<div
			role="button"
			onClick={onClick}
			className="flex cursor-pointer select-none items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-neutral-50/50 dark:hover:bg-neutral-850/30"
		>
			<div className="flex min-w-0 items-center gap-3">
				<MessageAvatar
					fromEmail={msg.fromEmail || ""}
					fromName={msg.fromName ?? null}
					isOutbound={isOutbound}
					size="sm"
				/>
				<span className="shrink-0 font-semibold text-sm text-text-strong-950 dark:text-white">
					{senderName}
				</span>
				<MessageBadge
					variant={getBadgeVariant(isApproval, isOutbound, isAgent)}
				/>
				<span className="truncate text-text-soft-400 text-xs">{snippet}</span>
			</div>

			<div className="flex shrink-0 items-center gap-2 font-medium text-text-soft-400 text-xs">
				<span>{dayjs(msg.messageAt).format("ddd, h:mm A")}</span>
				<Icon name="chevron-down" className="h-3.5 w-3.5" />
			</div>
		</div>
	);
};
