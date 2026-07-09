"use client";

import * as Dropdown from "@reloop/ui/dropdown";
import { cn } from "@reloop/ui/cn";
import {
	Archive,
	ArchiveRestore,
	Clock,
	Inbox,
	MoreHorizontal,
	Zap,
	Printer,
	Reply,
	Star,
	Trash2,
	X,
} from "lucide-react";
import type { ReactNode } from "react";

const iconBtn =
	"inline-flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[#313131] transition-colors hover:bg-[#404040]";

export const ZeroThreadToolbar = ({
	isStarred,
	isImportant,
	folder,
	onClose,
	onReplyAll,
	onToggleStar,
	onToggleImportant,
	onArchive,
	onUnarchive,
	onRestore,
	onDelete,
	onPrint,
	onMarkSpam,
	onMoveToInbox,
	onSnooze,
	onUnsubscribe,
	notesSlot,
	showBack,
}: {
	isStarred: boolean;
	isImportant?: boolean;
	folder?: string;
	onClose?: () => void;
	onReplyAll: () => void;
	onToggleStar: () => void;
	onToggleImportant?: () => void;
	onArchive: () => void;
	onUnarchive?: () => void;
	onRestore?: () => void;
	onDelete: () => void;
	onPrint: () => void;
	onMarkSpam: () => void;
	onMoveToInbox?: () => void;
	onSnooze?: () => void;
	onUnsubscribe?: () => void;
	notesSlot?: ReactNode;
	showBack?: boolean;
}) => {
	const inArchive = folder === "archive" || folder === "archived";
	const inTrash = folder === "trash";
	const inSpam = folder === "spam";
	const inSnoozed = folder === "snoozed";
	const showRestore = inArchive || inTrash || inSpam || inSnoozed;

	return (
		<div className="flex shrink-0 items-center px-1 pb-[10px] md:px-3 md:pb-[11px] md:pt-3">
			<div className="flex flex-1 items-center gap-2">
				{(showBack || onClose) && (
					<button
						type="button"
						onClick={onClose}
						className={cn(iconBtn, "md:hidden")}
						aria-label="Close"
					>
						<X className="h-3.5 w-3.5 text-mail-muted" />
					</button>
				)}
				{onClose && (
					<button
						type="button"
						onClick={onClose}
						className={cn(iconBtn, "hidden md:inline-flex")}
						aria-label="Close"
					>
						<X className="h-3.5 w-3.5 text-mail-muted" />
					</button>
				)}
			</div>

			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={onReplyAll}
					className="inline-flex h-7 cursor-pointer items-center justify-center gap-1 overflow-hidden rounded-lg border-none bg-[#313131] px-1.5 transition-colors hover:bg-[#404040]"
				>
					<Reply className="h-3.5 w-3.5 text-[#9B9B9B]" />
					<span className="whitespace-nowrap pr-1 text-sm leading-none text-mail-foreground">
						Reply all
					</span>
				</button>

				{notesSlot}

				<button
					type="button"
					onClick={onToggleStar}
					className={iconBtn}
					aria-label={isStarred ? "Unstar" : "Star"}
				>
					<Star
						className={cn(
							"h-4 w-4",
							isStarred
								? "fill-yellow-400 stroke-yellow-400"
								: "fill-transparent stroke-[#9D9D9D]",
						)}
					/>
				</button>

				{onToggleImportant && (
					<button
						type="button"
						onClick={onToggleImportant}
						className={iconBtn}
						aria-label={isImportant ? "Unmark important" : "Mark important"}
					>
						<Zap
							className={cn(
								"h-3.5 w-3.5",
								isImportant
									? "fill-amber-400 text-amber-400"
									: "text-mail-muted",
							)}
						/>
					</button>
				)}

				{onSnooze && !showRestore && (
					<button
						type="button"
						onClick={onSnooze}
						className={iconBtn}
						aria-label="Snooze"
					>
						<Clock className="h-3.5 w-3.5 text-mail-muted" />
					</button>
				)}

				{showRestore ? (
					<button
						type="button"
						onClick={
							inArchive
								? onUnarchive
								: inSnoozed
									? onMoveToInbox
									: onRestore
						}
						className={iconBtn}
						aria-label="Move to inbox"
					>
						{inArchive ? (
							<ArchiveRestore className="h-3.5 w-3.5 text-mail-muted" />
						) : (
							<Inbox className="h-3.5 w-3.5 text-mail-muted" />
						)}
					</button>
				) : (
					<button
						type="button"
						onClick={onArchive}
						className={iconBtn}
						aria-label="Archive"
					>
						<Archive className="h-3.5 w-3.5 text-mail-muted" />
					</button>
				)}

				<button
					type="button"
					onClick={onDelete}
					className="inline-flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-[#6E2532] bg-[#411D23] transition-colors hover:bg-[#6E2532]/70"
					aria-label={inTrash ? "Delete forever" : "Move to trash"}
				>
					<Trash2 className="h-3.5 w-3.5 text-[#F43F5E]" />
				</button>

				<Dropdown.Root>
					<Dropdown.Trigger asChild>
						<button type="button" className={iconBtn} aria-label="More actions">
							<MoreHorizontal className="h-4 w-4 text-mail-muted" />
						</button>
					</Dropdown.Trigger>
					<Dropdown.Content
						align="end"
						className="min-w-44 border-mail-border bg-[#313131] p-1"
					>
						{showRestore && (
							<Dropdown.Item
								className="rounded-md text-[13px] text-mail-muted hover:bg-[#404040]"
								onSelect={
									inArchive
										? onUnarchive
										: inSnoozed
											? onMoveToInbox
											: onRestore
								}
							>
								<Inbox className="mr-2 h-4 w-4" />
								Move to inbox
							</Dropdown.Item>
						)}
						<Dropdown.Item
							className="rounded-md text-[13px] text-mail-muted hover:bg-[#404040]"
							onSelect={onPrint}
						>
							<Printer className="mr-2 h-4 w-4" />
							Print thread
						</Dropdown.Item>
						{!inSpam && (
							<Dropdown.Item
								className="rounded-md text-[13px] text-mail-muted hover:bg-[#404040]"
								onSelect={onMarkSpam}
							>
								Move to spam
							</Dropdown.Item>
						)}
						{onUnsubscribe && (
							<Dropdown.Item
								className="rounded-md text-[13px] text-mail-muted hover:bg-[#404040]"
								onSelect={onUnsubscribe}
							>
								Unsubscribe
							</Dropdown.Item>
						)}
						{onToggleImportant && (
							<Dropdown.Item
								className="rounded-md text-[13px] text-mail-muted hover:bg-[#404040]"
								onSelect={onToggleImportant}
							>
								<Zap className="mr-2 h-4 w-4" />
								{isImportant ? "Unmark important" : "Mark as important"}
							</Dropdown.Item>
						)}
					</Dropdown.Content>
				</Dropdown.Root>
			</div>
		</div>
	);
};
