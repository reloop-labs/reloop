"use client";

import {
	getAvatarGradient,
	getAvatarInitial,
} from "@fe/dashboard/utils/avatar";
import * as Checkbox from "@reloop/ui/checkbox";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import dayjs from "dayjs";
import { User } from "lucide-react";
import { forwardRef, type ReactNode } from "react";
import type { InboundThread } from "../types";
import { useInboxMail } from "./use-inbox-mail";

const formatReceivedAt = (dateStr: string, isFirstToday: boolean) => {
	const date = dayjs(dateStr);
	const now = dayjs();
	if (date.isSame(now, "day")) {
		return isFirstToday
			? `Today, ${date.format("h:mm A")}`
			: date.format("h:mm A");
	}
	if (date.isSame(now.subtract(1, "day"), "day")) return "Yesterday";
	if (date.isAfter(now.subtract(7, "day"))) return date.format("ddd");
	return date.format("MMM D");
};

const highlightMatches = (text: string, query?: string): ReactNode => {
	const q = query?.trim();
	if (!q || !text) return text;

	const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const parts = text.split(new RegExp(`(${escaped})`, "gi"));
	if (parts.length === 1) return text;

	return parts.map((part, i) =>
		part.toLowerCase() === q.toLowerCase() ? (
			<mark
				key={`${part}-${i}`}
				className="rounded-sm bg-yellow-400/30 px-0.5 text-inherit"
			>
				{part}
			</mark>
		) : (
			part
		),
	);
};

export interface InboxThreadRowProps {
	thread: InboundThread;
	isSelected: boolean;
	isKeyboardFocused: boolean;
	isBulkSelected: boolean;
	isFirstToday: boolean;
	index: number;
	searchQuery?: string;
	onSelect: (id: string, event?: React.MouseEvent) => void;
	onMouseEnter: (id: string) => void;
	onToggleStar: (id: string, starred: boolean) => void;
	onArchive: (id: string) => void;
	onDelete: (id: string) => void;
	onToggleBulk: (id: string, event?: React.MouseEvent) => void;
}

export const InboxThreadRow = forwardRef<HTMLDivElement, InboxThreadRowProps>(
	(
		{
			thread,
			isSelected,
			isKeyboardFocused,
			isBulkSelected,
			isFirstToday,
			index,
			searchQuery,
			onSelect,
			onMouseEnter,
			onToggleStar,
			onArchive,
			onDelete,
			onToggleBulk,
		},
		ref,
	) => {
		const [mail] = useInboxMail();
		const listId = thread.id;
		const isUnread = thread.unread;
		const displayName =
			thread.from.name || thread.from.email.split("@")[0] || thread.from.email;
		const messageCount = thread.messageCount ?? 1;
		const snippet = thread.preview || thread.subject;
		const showAlert =
			thread.status === "needs_approval" || !!thread.isImportant;
		const showPerson =
			thread.direction !== "outbound" && thread.status !== "handled";
		const showTag = (thread.labels?.length ?? 0) > 0;

		return (
			<div
				ref={ref}
				data-thread-id={listId}
				onClick={(e) => onSelect(listId, e)}
				onMouseEnter={() => onMouseEnter(listId)}
				className={cn(
					"group relative mx-[8px] flex cursor-pointer flex-col items-start overflow-visible rounded-[10px] border-transparent py-3 text-left text-sm transition-colors hover:bg-[var(--inbox-hover)] hover:opacity-100",
					(isSelected || isBulkSelected || isKeyboardFocused) &&
						"bg-[var(--inbox-hover)]",
				)}
			>
				<div
					className={cn(
						"-translate-y-1/2 absolute top-[-1px] right-2 z-20 flex items-center gap-1 rounded-xl border border-mail-border/30 bg-panel-light p-1 opacity-0 shadow-xs transition-opacity group-hover:opacity-100 dark:bg-panel-dark",
					)}
				>
					<button
						type="button"
						title={thread.isStarred ? "Unstar" : "Star"}
						onClick={(e) => {
							e.stopPropagation();
							onToggleStar(thread.messageId ?? thread.id, !thread.isStarred);
						}}
						className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[var(--inbox-hover)]"
					>
						<Icon
							name={thread.isStarred ? "star-filled" : "star"}
							className={cn(
								"h-3.5 w-3.5",
								thread.isStarred ? "text-yellow-400" : "text-mail-muted",
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
						className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[var(--inbox-hover)]"
					>
						<Icon name="archive" className="h-3.5 w-3.5 text-mail-muted" />
					</button>
					<button
						type="button"
						title="Delete"
						onClick={(e) => {
							e.stopPropagation();
							onDelete(listId);
						}}
						className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
					>
						<Icon name="trash" className="h-3.5 w-3.5 text-red-500" />
					</button>
				</div>

				<div className="flex w-full items-start justify-between gap-3 px-4">
					{mail.bulkSelected.length > 0 ? (
						<div
							className="mt-0.5 shrink-0"
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
								"relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-semibold text-white text-xs uppercase",
								getAvatarGradient(thread.from.email),
								!isUnread && "border border-mail-border/40",
							)}
						>
							{getAvatarInitial(thread.from.name ?? null, thread.from.email)}
						</div>
					)}

					<div className="min-w-0 flex-1">
						<div className="flex w-full flex-row items-start justify-between gap-2">
							<div className="flex min-w-0 flex-row items-center gap-1">
								{thread.isPinned && (
									<Icon name="pin" className="h-3 w-3 shrink-0 text-mail-muted fill-mail-muted" />
								)}
								<span
									className={cn(
										"line-clamp-1 overflow-hidden text-sm",
										isUnread
											? "font-bold text-mail-foreground"
											: "font-medium text-mail-foreground",
									)}
								>
									{highlightMatches(displayName, searchQuery)}
									{thread.direction === "outbound" ? ", You" : ""}
									{messageCount > 1 && (
										<span className="ml-1 font-normal text-mail-muted">
											[{messageCount}]
										</span>
									)}
								</span>
								{isUnread && (
									<span className="ml-0.5 size-2 shrink-0 rounded-full bg-zero-blue" />
								)}
							</div>
							<span className="shrink-0 text-nowrap text-[11px] text-mail-muted tabular-nums opacity-70 group-hover:opacity-100 dark:text-[#8C8C8C]">
								{formatReceivedAt(thread.receivedAt, isFirstToday)}
							</span>
						</div>

						<div className="mt-1 flex items-end justify-between gap-2">
							<p className="line-clamp-1 min-w-0 flex-1 overflow-hidden text-[#8C8C8C] text-sm">
								{highlightMatches(snippet, searchQuery)}
							</p>
							{(showAlert || showPerson || showTag) && (
								<div className="flex shrink-0 items-center gap-1.5 pb-0.5">
									{showAlert && (
										<Icon
											name="alert-triangle"
											className="h-3.5 w-3.5 text-amber-400"
											aria-label="Alert"
										/>
									)}
									{showTag && (
										<Icon
											name="tag"
											className="h-3.5 w-3.5 text-blue-400"
											aria-label="Has labels"
										/>
									)}
									{showPerson && (
										<User
											className="h-3.5 w-3.5 text-emerald-400"
											aria-label="Direct"
										/>
									)}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		);
	},
);

InboxThreadRow.displayName = "InboxThreadRow";
