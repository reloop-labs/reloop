"use client";

import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import dayjs from "dayjs";
import type { AgentMailbox } from "../../types";
import { formatMessageTimestamp } from "./date-utils";
import { MessageAvatar } from "./message-avatar";
import { getBadgeVariant, MessageBadge } from "./message-badge";

interface MessageHeaderExpandedProps {
	msg: any;
	mailbox: AgentMailbox | undefined;
	thread: any;
	isOutbound: boolean;
	isApproval: boolean;
	isAgent: boolean;
	onToggleExpand: () => void;
	onReply: () => void;
	onForward: () => void;
	onDelete: () => void;
	onToggleRead: (isRead: boolean) => void;
	onMarkSpam: (isSpam: boolean) => void;
	onTranslate: () => void;
	onPrint: () => void;
	onDownload: () => void;
	onShowOriginal: () => void;
}

/**
 * Expanded header row for a thread message card.
 * Shows: avatar · sender name · badge · email · "to me" popover  |  date · more-menu · chevron-up
 */
export const MessageHeaderExpanded = ({
	msg,
	mailbox,
	thread,
	isOutbound,
	isApproval,
	isAgent,
	onToggleExpand,
	onReply,
	onForward,
	onDelete,
	onToggleRead,
	onMarkSpam,
	onTranslate,
	onPrint,
	onDownload,
	onShowOriginal,
}: MessageHeaderExpandedProps) => {
	const email = msg.email;

	const senderName = isOutbound
		? "You"
		: isApproval
			? "Agent"
			: msg.fromName ||
				(msg.fromEmail ? msg.fromEmail.split("@")[0] : "Unknown");

	return (
		<div
			role="button"
			onClick={onToggleExpand}
			className="flex cursor-pointer select-none items-center justify-between gap-4 px-5 pt-4 pb-3 transition-colors hover:bg-neutral-50/20 dark:hover:bg-neutral-850/10"
		>
			{/* Left: Avatar + Info */}
			<div className="flex min-w-0 items-center gap-3">
				<MessageAvatar
					fromEmail={msg.fromEmail || ""}
					fromName={msg.fromName ?? null}
					isOutbound={isOutbound}
					isAgent={isAgent}
				/>

				<div className="flex min-w-0 flex-col gap-0.5">
					{/* Row 1: sender name · badge · email */}
					<div className="flex flex-wrap items-center gap-1.5">
						<span className="font-semibold text-sm text-text-strong-950 dark:text-white">
							{senderName}
						</span>
						<MessageBadge
							variant={getBadgeVariant(isApproval, isOutbound, isAgent)}
						/>
						{msg.fromEmail && (
							<span className="text-text-soft-400 text-xs">
								{msg.fromEmail}
							</span>
						)}
					</div>
				</div>
			</div>

			{/* Right: Date · Collapse chevron */}
			<div
				className="flex shrink-0 items-center gap-1.5"
				onClick={(e) => e.stopPropagation()}
			>
				<span className="text-text-soft-400 text-xs">
					{formatMessageTimestamp(msg.messageAt)}
				</span>

				<button
					type="button"
					onClick={onToggleExpand}
					className="rounded-lg p-1 text-text-soft-400 hover:bg-neutral-100 hover:text-text-strong-950 dark:hover:bg-zinc-800"
				>
					<Icon name="chevron-up" className="h-4 w-4" />
				</button>
			</div>
		</div>
	);
};
