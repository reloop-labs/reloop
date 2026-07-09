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
	accentColor: string;
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
	accentColor,
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
			className="flex cursor-pointer select-none items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-[var(--inbox-hover)]"
		>
			{/* Left: Avatar + Info */}
			<div className="flex min-w-0 items-center gap-3">
				<div className="flex shrink-0 items-center gap-2.5">
					<div
						className="h-8 w-[3.5px] rounded-full"
						style={{ backgroundColor: accentColor }}
					/>
					<MessageAvatar
						fromEmail={msg.fromEmail || ""}
						fromName={msg.fromName ?? null}
						isOutbound={isOutbound}
						isAgent={isAgent}
					/>
				</div>

				<div className="flex min-w-0 flex-col gap-0.5">
					{/* Row 1: sender name · badge · email */}
					<div className="flex flex-wrap items-center gap-1.5">
						<span className="font-semibold text-mail-foreground text-mail-foreground text-sm">
							{senderName}
						</span>
						<MessageBadge
							variant={getBadgeVariant(isApproval, isOutbound, isAgent)}
						/>
						{msg.fromEmail && (
							<span className="font-mono text-mail-muted text-xs">
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
				<p className="text-mail-muted text-xs">
					{formatMessageTimestamp(msg.messageAt)}
				</p>

				<button
					type="button"
					onClick={onToggleExpand}
					className="rounded-lg p-1 text-mail-muted hover:bg-[var(--inbox-hover)] hover:bg-offset-light hover:text-mail-foreground"
				>
					<Icon name="chevron-up" className="h-4 w-4" />
				</button>
			</div>
		</div>
	);
};
