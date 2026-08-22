import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import dayjs from "dayjs";
import { forwardRef, type ReactNode } from "react";
import { parseEmail } from "#/features/agent-inbox/lib/email-address";
import { resolveLabelColor } from "#/features/agent-inbox/lib/label-colors";
import type { InboundThread } from "../../types";
import { useInboxMail } from "./use-inbox-mail";

function formatRecipientLabel(addresses: string[] | undefined): string {
	if (!addresses?.length) return "No recipients";
	return addresses
		.map((addr) => {
			const { name, email } = parseEmail(addr);
			return name || email.split("@")[0] || email;
		})
		.filter(Boolean)
		.join(", ");
}

const formatReceivedAt = (dateStr: string) => {
	const date = dayjs(dateStr);
	const now = dayjs();
	if (date.isSame(now, "day")) {
		return date.format("h:mm A");
	}
	if (date.isSame(now, "year")) {
		return date.format("MMM D");
	}
	return date.format("MMM D, YYYY");
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

function chipBackground(color: string | undefined): string {
	const hex = resolveLabelColor(color);
	// Soft fill from label color (12% opacity)
	if (hex.startsWith("#") && (hex.length === 7 || hex.length === 4)) {
		const full =
			hex.length === 4
				? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
				: hex;
		const r = Number.parseInt(full.slice(1, 3), 16);
		const g = Number.parseInt(full.slice(3, 5), 16);
		const b = Number.parseInt(full.slice(5, 7), 16);
		return `rgba(${r}, ${g}, ${b}, 0.14)`;
	}
	return "var(--inbox-chip-bg)";
}

export interface InboxThreadRowProps {
	thread: InboundThread;
	isSelected: boolean;
	isKeyboardFocused: boolean;
	isBulkSelected: boolean;
	isFirstToday?: boolean;
	index: number;
	searchQuery?: string;
	onSelect: (id: string, event?: React.MouseEvent) => void;
	onMouseEnter: (id: string) => void;
	onToggleStar: (id: string, starred: boolean) => void;
	onArchive: (id: string) => void;
	onUnarchive?: (id: string) => void;
	onDelete: (id: string) => void;
	onToggleBulk: (id: string, event?: React.MouseEvent) => void;
	isArchived?: boolean;
}

export const InboxThreadRow = forwardRef<HTMLDivElement, InboxThreadRowProps>(
	(
		{
			thread,
			isSelected,
			isKeyboardFocused,
			isBulkSelected,
			searchQuery,
			onSelect,
			onMouseEnter,
			onToggleStar,
			onArchive,
			onUnarchive,
			onDelete,
			onToggleBulk,
			isArchived,
		},
		ref,
	) => {
		const [mail] = useInboxMail();
		const listId = thread.id;
		const isUnread = thread.unread;
		const isOutbound = thread.direction === "outbound";
		const isSelectMode = mail.bulkSelected.length > 0;
		const displayName = isOutbound
			? formatRecipientLabel(thread.toEmails)
			: thread.from.name ||
				thread.from.email.split("@")[0] ||
				thread.from.email;
		const messageCount = thread.messageCount ?? 1;
		const subject = (thread.subject || "").trim() || "(No Subject)";
		const preview = (thread.preview || "").trim().replace(/\s+/g, " ");
		const primaryLabel = thread.labels?.[0];

		return (
			<div
				ref={ref}
				data-thread-id={listId}
				onClick={(e) => onSelect(listId, e)}
				onMouseEnter={() => onMouseEnter(listId)}
				className={cn(
					"group flex cursor-pointer items-center border-b pt-2.5 pr-6 pb-2.5 pl-4 text-left",
					"border-stroke-soft-100 bg-transparent",
					"hover:bg-neutral-alpha-10",
					(isSelected || isBulkSelected || isKeyboardFocused) &&
						"bg-neutral-alpha-10",
				)}
			>
				{/* Bulk select checkbox */}
				<span className="flex w-5 shrink-0 items-center justify-center">
					<button
						type="button"
						aria-label={isBulkSelected ? "Deselect thread" : "Select thread"}
						aria-pressed={isBulkSelected}
						onClick={(e) => {
							e.stopPropagation();
							onToggleBulk(listId, e);
						}}
						className={cn(
							"flex size-4 items-center justify-center rounded border",
							isBulkSelected
								? "border-zero-blue bg-zero-blue text-white"
								: "border-stroke-soft-200 bg-transparent hover:border-stroke-sub-300 dark:border-stroke-soft-100/60",
						)}
					>
						{isBulkSelected && (
							<Icon name="check" className="h-2.5 w-2.5 text-white" />
						)}
					</button>
				</span>

				{/* Star button */}
				<span className="ml-1.5 flex w-5 shrink-0 items-center justify-center">
					<button
						type="button"
						title={thread.isStarred ? "Unstar" : "Star"}
						onClick={(e) => {
							e.stopPropagation();
							onToggleStar(thread.messageId ?? thread.id, !thread.isStarred);
						}}
						className="flex size-5 items-center justify-center"
					>
						<Icon
							name={thread.isStarred ? "star-filled" : "star"}
							className={cn(
								"h-4 w-4",
								thread.isStarred
									? "fill-amber-400 text-amber-400"
									: "text-text-soft-400/60 group-hover:text-text-soft-400",
							)}
						/>
					</button>
				</span>

				{/* Sender */}
				<span
					className="ml-3 flex shrink-0 items-center gap-1.5 truncate pr-4"
					style={{ width: "clamp(120px, 20%, 180px)" }}
				>
					<span
						className={cn(
							"truncate text-[14px] leading-5",
							isUnread
								? "font-semibold text-text-strong-950"
								: "font-normal text-text-sub-600",
						)}
					>
						{highlightMatches(displayName, searchQuery)}
					</span>
					{messageCount > 1 && (
						<span className="shrink-0 text-[13px] text-text-soft-400">
							{messageCount}
						</span>
					)}
				</span>

				{/* Subject + preview */}
				<div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden pr-3">
					{primaryLabel && (
						<span
							className="mr-1 flex h-5 max-w-30 shrink-0 items-center truncate rounded-[6px] border px-1.5 font-medium text-[11px]"
							style={{
								background: chipBackground(primaryLabel.color),
								color: "var(--inbox-chip-fg)",
								borderColor: "var(--inbox-chip-border)",
							}}
						>
							{primaryLabel.name}
						</span>
					)}
					<span className="truncate text-[14px] leading-5">
						<span
							className={cn(
								isUnread
									? "font-semibold text-text-strong-950"
									: "font-normal text-text-sub-600",
							)}
						>
							{highlightMatches(subject, searchQuery)}
						</span>
						{preview && (
							<>
								<span className="mx-1 text-text-soft-400/60">-</span>
								<span className="font-normal text-[13px] text-text-soft-400">
									{highlightMatches(preview, searchQuery)}
								</span>
							</>
						)}
					</span>
				</div>

				{/* Hover actions */}
				<span
					className={cn(
						"ml-2 flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100",
						isSelectMode && "pointer-events-none opacity-0",
					)}
				>
					{isArchived || thread.isArchived ? (
						<button
							type="button"
							title="Move to inbox"
							onClick={(e) => {
								e.stopPropagation();
								if (onUnarchive) {
									onUnarchive(listId);
								} else {
									onArchive(listId);
								}
							}}
							className="flex size-7 items-center justify-center rounded-md hover:bg-bg-soft-200 dark:hover:bg-neutral-alpha-16"
						>
							<Icon name="inbox" className="h-3.5 w-3.5 text-text-sub-600" />
						</button>
					) : (
						<button
							type="button"
							title="Archive"
							onClick={(e) => {
								e.stopPropagation();
								onArchive(listId);
							}}
							className="flex size-7 items-center justify-center rounded-md hover:bg-bg-soft-200 dark:hover:bg-neutral-alpha-16"
						>
							<Icon name="archive" className="h-3.5 w-3.5 text-text-sub-600" />
						</button>
					)}
					<button
						type="button"
						title="Delete"
						onClick={(e) => {
							e.stopPropagation();
							onDelete(listId);
						}}
						className="flex size-7 items-center justify-center rounded-md hover:bg-red-50 dark:hover:bg-red-950/30"
					>
						<Icon name="trash" className="h-3.5 w-3.5 text-red-500" />
					</button>
				</span>

				{/* Date/Time */}
				<span className="ml-2 w-18 shrink-0 whitespace-nowrap text-right font-normal text-[12.5px] text-text-soft-400 tabular-nums">
					{formatReceivedAt(thread.receivedAt)}
				</span>
			</div>
		);
	},
);

InboxThreadRow.displayName = "InboxThreadRow";
