"use client";

import { useAgentInbox } from "@fe/dashboard/app/(protected)/inbox/components/agent-inbox-provider";
import { useInboxLabels } from "@fe/dashboard/app/(protected)/inbox/hooks/use-inbox-labels";
import type { InboundThread } from "@fe/dashboard/app/(protected)/inbox/types";
import * as ContextMenu from "@reloop/ui/context-menu";
import {
	Archive,
	ExternalLink,
	Forward,
	Inbox,
	Mail,
	MailOpen,
	Reply,
	ReplyAll,
	Tag,
	Trash2,
	Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { Icon } from "@reloop/ui/icon";

const itemClass =
	"rounded-md text-[13px] text-mail-muted data-[highlighted]:bg-[var(--inbox-control-hover)] data-[highlighted]:text-mail-foreground";

const contentClass =
	"min-w-48 border-mail-border bg-[var(--inbox-control)] p-1";

export type ThreadContextMenuProps = {
	thread: InboundThread;
	mailboxId: string;
	folder?: string;
	children: ReactNode;
	onOpenThread: (id: string) => void;
	onReply?: (thread: InboundThread) => void;
	onReplyAll?: (thread: InboundThread) => void;
	onForward?: (thread: InboundThread) => void;
};

const resolveThreadId = (thread: InboundThread) => thread.threadId || thread.id;

const resolveMessageId = (thread: InboundThread) =>
	thread.messageId ?? thread.id;

export const ThreadContextMenu = ({
	thread,
	mailboxId,
	folder,
	children,
	onOpenThread,
	onReply,
	onReplyAll,
	onForward,
}: ThreadContextMenuProps) => {
	const {
		toggleMessageStar,
		toggleThreadImportant,
		markMessageRead,
		archiveThread,
		trashThread,
		restoreThread,
		unarchiveThread,
		markMessageSpam,
	} = useAgentInbox();
	const { labels, assignThreadToLabel } = useInboxLabels(mailboxId);

	const threadId = resolveThreadId(thread);
	const messageId = resolveMessageId(thread);
	const inArchive = folder === "archive" || folder === "archived";
	const inTrash = folder === "trash";
	const inSpam = folder === "spam";
	const showMoveToInbox = inArchive || inTrash || inSpam;

	const run = async (action: () => Promise<void>, success: string) => {
		try {
			await action();
			toast.success(success);
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : "Action failed");
		}
	};

	const handleOpenInNewTab = () => {
		const url = new URL(window.location.href);
		url.searchParams.set("threadId", thread.id);
		window.open(url.toString(), "_blank", "noopener,noreferrer");
	};

	const handleMoveToInbox = async () => {
		if (inSpam) {
			await markMessageSpam(messageId, false);
		} else if (inArchive) {
			await unarchiveThread(threadId);
		} else {
			await restoreThread(threadId);
		}
	};

	return (
		<ContextMenu.Root>
			<ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
			<ContextMenu.Content className={contentClass}>
				<ContextMenu.Item
					className={itemClass}
					onSelect={() => onOpenThread(thread.id)}
				>
					Open
				</ContextMenu.Item>
				<ContextMenu.Item className={itemClass} onSelect={handleOpenInNewTab}>
					<ExternalLink className="h-3.5 w-3.5" />
					Open in new tab
				</ContextMenu.Item>

				<ContextMenu.Separator className="my-1 h-px bg-mail-border/40" />

				{onReply && (
					<ContextMenu.Item
						className={itemClass}
						onSelect={() => onReply(thread)}
					>
						<Reply className="h-3.5 w-3.5" />
						Reply
					</ContextMenu.Item>
				)}
				{onReplyAll && (
					<ContextMenu.Item
						className={itemClass}
						onSelect={() => onReplyAll(thread)}
					>
						<ReplyAll className="h-3.5 w-3.5" />
						Reply all
					</ContextMenu.Item>
				)}
				{onForward && (
					<ContextMenu.Item
						className={itemClass}
						onSelect={() => onForward(thread)}
					>
						<Forward className="h-3.5 w-3.5" />
						Forward
					</ContextMenu.Item>
				)}

				{(onReply || onReplyAll || onForward) && (
					<ContextMenu.Separator className="my-1 h-px bg-mail-border/40" />
				)}

				<ContextMenu.Item
					className={itemClass}
					onSelect={() =>
						void run(
							() => toggleMessageStar(messageId, !thread.isStarred),
							thread.isStarred ? "Unstarred" : "Starred",
						)
					}
				>
					<Icon
						name={thread.isStarred ? "star-filled" : "star"}
						className="h-3.5 w-3.5"
					/>
					{thread.isStarred ? "Unstar" : "Star"}
				</ContextMenu.Item>

				<ContextMenu.Item
					className={itemClass}
					onSelect={() =>
						void run(
							() => toggleThreadImportant(threadId, !thread.isImportant),
							thread.isImportant ? "Unmarked important" : "Marked important",
						)
					}
				>
					<Zap className="h-3.5 w-3.5" />
					{thread.isImportant ? "Unmark important" : "Mark important"}
				</ContextMenu.Item>

				<ContextMenu.Item
					className={itemClass}
					onSelect={() =>
						void run(
							() => markMessageRead(messageId, thread.unread),
							thread.unread ? "Marked as read" : "Marked as unread",
						)
					}
				>
					{thread.unread ? (
						<MailOpen className="h-3.5 w-3.5" />
					) : (
						<Mail className="h-3.5 w-3.5" />
					)}
					{thread.unread ? "Mark as read" : "Mark as unread"}
				</ContextMenu.Item>

				<ContextMenu.Separator className="my-1 h-px bg-mail-border/40" />

				{!showMoveToInbox && (
					<ContextMenu.Item
						className={itemClass}
						onSelect={() => void run(() => archiveThread(threadId), "Archived")}
					>
						<Archive className="h-3.5 w-3.5" />
						Archive
					</ContextMenu.Item>
				)}

				{showMoveToInbox && (
					<ContextMenu.Item
						className={itemClass}
						onSelect={() => void run(handleMoveToInbox, "Moved to inbox")}
					>
						<Inbox className="h-3.5 w-3.5" />
						Move to inbox
					</ContextMenu.Item>
				)}

				{!inTrash && (
					<ContextMenu.Item
						className={itemClass}
						onSelect={() =>
							void run(() => trashThread(threadId), "Moved to trash")
						}
					>
						<Trash2 className="h-3.5 w-3.5" />
						Move to trash
					</ContextMenu.Item>
				)}

				{!inSpam && (
					<ContextMenu.Item
						className={itemClass}
						onSelect={() =>
							void run(() => markMessageSpam(messageId, true), "Moved to spam")
						}
					>
						Move to spam
					</ContextMenu.Item>
				)}

				{labels.length > 0 && (
					<>
						<ContextMenu.Separator className="my-1 h-px bg-mail-border/40" />
						<ContextMenu.MenuSub>
							<ContextMenu.MenuSubTrigger className={itemClass}>
								<Tag className="h-3.5 w-3.5" />
								Labels
							</ContextMenu.MenuSubTrigger>
							<ContextMenu.MenuSubContent className={contentClass}>
								{labels.map((label) => (
									<ContextMenu.Item
										key={label.id}
										className={itemClass}
										onSelect={() =>
											void run(
												() => assignThreadToLabel(threadId, label.id),
												`Added to ${label.name}`,
											)
										}
									>
										<span
											className="h-2 w-2 shrink-0 rounded-full"
											style={{
												backgroundColor:
													label.color === "default" ? "#9B9B9B" : label.color,
											}}
										/>
										{label.name}
									</ContextMenu.Item>
								))}
							</ContextMenu.MenuSubContent>
						</ContextMenu.MenuSub>
					</>
				)}
			</ContextMenu.Content>
		</ContextMenu.Root>
	);
};
