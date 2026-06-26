"use client";

import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import dayjs from "dayjs";
import type { AgentMailbox } from "../../types";
import { MessageAvatar } from "./message-avatar";
import { getBadgeVariant, MessageBadge } from "./message-badge";
import { formatMessageTimestamp } from "./date-utils";

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
			className="flex cursor-pointer select-none items-start justify-between gap-4 px-5 pt-4 pb-3 transition-colors hover:bg-neutral-50/20 dark:hover:bg-neutral-850/10"
		>
			{/* Left: Avatar + Info */}
			<div
				className="flex min-w-0 items-start gap-3"
				onClick={(e) => {
					if ((e.target as HTMLElement).closest(".group\\/tome")) {
						e.stopPropagation();
					}
				}}
			>
				<MessageAvatar
					fromEmail={msg.fromEmail || ""}
					fromName={msg.fromName ?? null}
					isOutbound={isOutbound}
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

					{/* Row 2: "to me" with hover detail popover */}
					<div className="group/tome relative inline-flex cursor-pointer items-center gap-1 text-text-soft-400 text-xs">
						<span>to {isOutbound ? email?.toEmails?.join(", ") : "me"}</span>
						<Icon name="chevron-down" className="h-3 w-3" />

						<div className="pointer-events-none absolute top-full left-0 z-30 mt-1.5 flex w-72 origin-top-left scale-95 flex-col gap-2 rounded-xl border border-stroke-soft-100 bg-bg-white-0 p-3 text-text-sub-600 opacity-0 shadow-xl transition-all duration-150 group-hover/tome:pointer-events-auto group-hover/tome:scale-100 group-hover/tome:opacity-100 dark:border-stroke-soft-100/30 dark:bg-neutral-900 dark:text-text-sub-400">
							<div className="grid grid-cols-[44px_minmax(0,1fr)] gap-x-2 gap-y-1.5 text-xs leading-relaxed">
								<span className="text-right font-medium text-text-soft-400">
									from:
								</span>
								<span className="truncate font-semibold text-text-strong-950 dark:text-white">
									{msg.fromName
										? `${msg.fromName} <${msg.fromEmail || ""}>`
										: msg.fromEmail || ""}
								</span>

								<span className="text-right font-medium text-text-soft-400">
									to:
								</span>
								<span className="truncate font-semibold text-text-strong-950 dark:text-white">
									{email?.toEmails?.join(", ") || mailbox?.email || "me"}
								</span>

								{email?.ccEmails && email.ccEmails.length > 0 && (
									<>
										<span className="text-right font-medium text-text-soft-400">
											cc:
										</span>
										<span className="truncate font-semibold text-text-strong-950 dark:text-white">
											{email.ccEmails.join(", ")}
										</span>
									</>
								)}

								<span className="text-right font-medium text-text-soft-400">
									date:
								</span>
								<span className="font-semibold text-text-strong-950 dark:text-white">
									{dayjs(msg.messageAt).format("ddd, MMM D, YYYY [at] h:mm A")}
								</span>

								<span className="text-right font-medium text-text-soft-400">
									subject:
								</span>
								<span className="break-words font-semibold text-text-strong-950 dark:text-white">
									{msg.subject || thread.subject}
								</span>
							</div>
						</div>
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
