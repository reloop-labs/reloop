"use client";

import {
	getAvatarGradient,
	getAvatarInitial,
} from "@fe/dashboard/utils/avatar";
import * as Checkbox from "@reloop/ui/checkbox";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import dayjs from "dayjs";
import { Archive, Star, Trash2 } from "lucide-react";
import type { InboundThread } from "../types";
import { useInboxMail } from "./use-inbox-mail";

const getActorInfo = (
	thread: InboundThread,
): {
	tag: string | null;
	tagStyle: string;
	tagIcon: string;
} => {
	if (thread.direction === "outbound") {
		return {
			tag: "via you",
			tagIcon: "user",
			tagStyle: "bg-mail-accent text-mail-muted",
		};
	}
	switch (thread.status) {
		case "needs_approval":
			return {
				tag: "needs you",
				tagIcon: "alert-triangle",
				tagStyle: "bg-[#C47839]/10 text-[#C47839]",
			};
		case "handled":
		case "parsing":
			return {
				tag: "via agent",
				tagIcon: "robot",
				tagStyle: "bg-[#3B629B]/10 text-[#3B629B]",
			};
		default:
			return { tag: null, tagIcon: "", tagStyle: "" };
	}
};

const formatReceivedAt = (dateStr: string, isFirstToday: boolean) => {
	const date = dayjs(dateStr);
	const now = dayjs();
	if (date.isSame(now, "day")) {
		return isFirstToday ? `Today, ${date.format("h:mm A")}` : date.format("h:mm A");
	}
	if (date.isSame(now.subtract(1, "day"), "day")) return "Yesterday";
	if (date.isAfter(now.subtract(7, "day"))) return date.format("ddd");
	return date.format("MMM D");
};

export interface InboxThreadRowProps {
	thread: InboundThread;
	isSelected: boolean;
	isKeyboardFocused: boolean;
	isBulkSelected: boolean;
	isFirstToday: boolean;
	index: number;
	onSelect: (id: string) => void;
	onMouseEnter: (id: string) => void;
	onToggleStar: (id: string, starred: boolean) => void;
	onArchive: (id: string) => void;
	onDelete: (id: string) => void;
	onToggleBulk: (id: string) => void;
}

export const InboxThreadRow = ({
	thread,
	isSelected,
	isKeyboardFocused,
	isBulkSelected,
	isFirstToday,
	index,
	onSelect,
	onMouseEnter,
	onToggleStar,
	onArchive,
	onDelete,
	onToggleBulk,
}: InboxThreadRowProps) => {
	const [mail] = useInboxMail();
	const actorInfo = getActorInfo(thread);
	const listId = thread.id;
	const isUnread = thread.unread;
	const displayName =
		thread.from.name || thread.from.email.split("@")[0] || thread.from.email;

	return (
		<div
			data-thread-id={listId}
			onClick={() => onSelect(listId)}
			onMouseEnter={() => onMouseEnter(listId)}
			className={cn(
				"group relative mx-[8px] flex cursor-pointer flex-col items-start overflow-visible rounded-[10px] border-transparent py-3 text-left text-sm transition-colors hover:bg-offset-dark/50 hover:opacity-100",
				(isSelected || isBulkSelected || isKeyboardFocused) &&
					"bg-[#202020]",
			)}
		>
			{/* Hover action bar */}
			<div
				className={cn(
					"absolute right-2 z-20 flex -translate-y-1/2 items-center gap-1 rounded-xl border border-mail-border/30 bg-panel-dark p-1 opacity-0 shadow-xs transition-opacity group-hover:opacity-100",
					index === 0 ? "top-4" : "top-[-1px]",
				)}
			>
				<button
					type="button"
					title={thread.isStarred ? "Unstar" : "Star"}
					onClick={(e) => {
						e.stopPropagation();
						onToggleStar(thread.messageId ?? thread.id, !thread.isStarred);
					}}
					className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-offset-light hover:bg-[#202020]"
				>
					<Star
						className={cn(
							"h-3.5 w-3.5",
							thread.isStarred
								? "fill-yellow-400 stroke-yellow-400"
								: "stroke-mail-muted",
						)}
					/>
				</button>
				<button
					type="button"
					title="Archive"
					onClick={(e) => {
						e.stopPropagation();
						onArchive(listId);
					}}
					className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-offset-light hover:bg-[#202020]"
				>
					<Archive className="h-3.5 w-3.5 stroke-mail-muted" />
				</button>
				<button
					type="button"
					title="Delete"
					onClick={(e) => {
						e.stopPropagation();
						onDelete(thread.messageId ?? thread.id);
					}}
					className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-red-50 hover:bg-red-950/30"
				>
					<Trash2 className="h-3.5 w-3.5 stroke-red-500" />
				</button>
			</div>

			<div className="flex w-full items-center justify-between gap-4 px-4">
				{mail.bulkSelected.length > 0 ? (
					<div
						className="shrink-0"
						onClick={(e) => e.stopPropagation()}
					>
						<Checkbox.Root
							checked={isBulkSelected}
							onCheckedChange={() => onToggleBulk(listId)}
						/>
					</div>
				) : (
					<div
						className={cn(
							"relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-semibold text-white text-xs uppercase",
							getAvatarGradient(thread.from.email),
							isUnread && "border-0",
							!isUnread && "border border-mail-border/40",
						)}
					>
						{getAvatarInitial(thread.from.name ?? null, thread.from.email)}
					</div>
				)}

				<div className="min-w-0 flex-1">
					<div className="flex w-full flex-row items-center justify-between">
						<div className="flex min-w-0 flex-row items-center gap-1">
							<span
								className={cn(
									"truncate text-[13px]",
									isUnread
										? "font-semibold text-mail-foreground"
										: "font-medium text-mail-muted",
								)}
							>
								{displayName}
								{thread.direction === "outbound" ? ", You" : ""}
							</span>
							{isUnread && (
								<span className="ml-0.5 size-2 shrink-0 rounded-full bg-zero-blue" />
							)}
						</div>
						<span className="shrink-0 text-[11px] text-mail-muted tabular-nums group-hover:opacity-0">
							{formatReceivedAt(thread.receivedAt, isFirstToday)}
						</span>
					</div>

					<div
						className={cn(
							"truncate text-[13px]",
							isUnread
								? "font-semibold text-mail-foreground"
								: "text-mail-foreground",
						)}
					>
						{thread.subject}
					</div>

					<div className="truncate text-[12px] text-mail-muted leading-relaxed">
						{thread.preview}
					</div>

					{actorInfo.tag && (
						<span
							className={cn(
								"mt-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-medium text-[10px]",
								actorInfo.tagStyle,
							)}
						>
							<Icon name={actorInfo.tagIcon as "robot"} className="h-2.5 w-2.5" />
							{actorInfo.tag}
						</span>
					)}

					{thread.attachments && thread.attachments.length > 0 && (
						<div className="mt-1 flex items-center gap-1">
							<Icon name="file-text" className="h-3 w-3 text-mail-muted" />
							<span className="text-[10px] text-mail-muted">
								{thread.attachments.length} attachment
								{thread.attachments.length > 1 ? "s" : ""}
							</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
