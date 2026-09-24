import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import dayjs from "dayjs";
import { type CSSProperties, forwardRef, type ReactNode } from "react";
import { parseEmail } from "#/features/agent-inbox/lib/email-address";
import { resolveLabelColor } from "#/features/agent-inbox/lib/label-colors";
import type { InboundThread } from "../../types";
import { ListAttachmentChip } from "./list-attachment-chip";

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

function hexChannels(hex: string): [number, number, number] {
	const full =
		hex.length === 4
			? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
			: hex;
	const valid = /^#[0-9a-fA-F]{6}$/.test(full);
	const safe = valid ? full : "#9B9B9B";
	return [
		Number.parseInt(safe.slice(1, 3), 16),
		Number.parseInt(safe.slice(3, 5), 16),
		Number.parseInt(safe.slice(5, 7), 16),
	];
}

/** Mix a hex color toward a target rgb; amount 0..1. */
function mixHex(
	hex: string,
	target: [number, number, number],
	amount: number,
): string {
	const [r, g, b] = hexChannels(hex);
	const m = (c: number, t: number) => Math.round(c + (t - c) * amount);
	return `#${((1 << 24) + (m(r, target[0]) << 16) + (m(g, target[1]) << 8) + m(b, target[2])).toString(16).slice(1)}`;
}

function rgba(hex: string, alpha: number): string {
	const [r, g, b] = hexChannels(hex);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Per-label badge palette that stays readable in both modes:
 * soft tint + shaded text in light, glowing tint + tinted text in dark.
 */
function labelChipVars(color: string | undefined): CSSProperties {
	const hex = resolveLabelColor(color);
	return {
		"--lb": rgba(hex, 0.1),
		"--lt": mixHex(hex, [24, 24, 28], 0.45),
		"--lr": rgba(hex, 0.3),
		"--ld": hex,
		"--lbd": rgba(hex, 0.18),
		"--ltd": mixHex(hex, [255, 255, 255], 0.6),
		"--lrd": rgba(hex, 0.5),
	} as CSSProperties;
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
	onToggleBulk: (id: string, event?: React.MouseEvent) => void;
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
			onToggleBulk,
		},
		ref,
	) => {
		const listId = thread.id;
		const isUnread = thread.unread;
		const isOutbound = thread.direction === "outbound";
		const displayName = isOutbound
			? formatRecipientLabel(thread.toEmails)
			: thread.from.name ||
				thread.from.email.split("@")[0] ||
				thread.from.email;
		const messageCount = thread.messageCount ?? 1;
		const subject = (thread.subject || "").trim() || "(No Subject)";
		const preview = (thread.preview || "").trim().replace(/\s+/g, " ");
		const rowLabels = (thread.labels ?? []).slice(0, 2);
		const hiddenLabelCount = Math.max(
			0,
			(thread.labels ?? []).length - rowLabels.length,
		);
		const visibleAttachments = (thread.attachments ?? []).filter(
			(att) => att.isInline !== true,
		);
		const isFailed =
			thread.status === "failed" ||
			thread.status === "bounced" ||
			thread.deliveryStatus === "failed" ||
			thread.deliveryStatus === "bounced" ||
			Boolean(thread.errorMessage);

		return (
			<div
				ref={ref}
				data-thread-id={listId}
				onClick={(e) => onSelect(listId, e)}
				onMouseEnter={() => onMouseEnter(listId)}
				className={cn(
					"group flex cursor-pointer items-start border-b pt-2.5 pr-6 pb-2.5 pl-4 text-left",
					"border-stroke-soft-100 bg-transparent dark:border-stroke-soft-100/40",
					"hover:bg-neutral-alpha-10",
					(isSelected || isBulkSelected || isKeyboardFocused) &&
						"bg-neutral-alpha-10",
				)}
			>
				{/* Bulk select checkbox */}
				<span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
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
				<span className="mt-0.5 ml-1.5 flex h-5 w-5 shrink-0 items-center justify-center">
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
					className="mt-0.5 ml-3 flex h-5 shrink-0 items-center gap-1.5 truncate pr-4"
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
				<div className="flex min-w-0 flex-1 flex-col justify-start gap-1 overflow-hidden pr-3">
					<div className="flex min-w-0 items-center gap-1.5">
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
							{preview ? (
								<>
									<span className="mx-1 text-text-soft-400/60">-</span>
									<span className="font-normal text-[13px] text-text-soft-400">
										{highlightMatches(preview, searchQuery)}
									</span>
								</>
							) : null}
						</span>
					</div>
					{visibleAttachments.length > 0 ? (
						<div className="flex min-w-0 items-center gap-1.5">
							{visibleAttachments.slice(0, 2).map((att, index) => (
								<ListAttachmentChip
									key={`${att.name}-${index}`}
									filename={att.name}
								/>
							))}
							{visibleAttachments.length > 2 ? (
								<span className="shrink-0 text-[12px] text-text-soft-400">
									+{visibleAttachments.length - 2}
								</span>
							) : null}
						</div>
					) : null}
				</div>

				{/* Labels at the end, before the time */}
				{rowLabels.length > 0 ? (
					<span className="mt-0.5 ml-2 flex shrink-0 items-center gap-1">
						{rowLabels.map((label) => (
							<span
								key={label.id}
								style={labelChipVars(label.color)}
								className="flex h-[22px] max-w-28 shrink-0 items-center gap-1.5 truncate rounded-[8px] border border-(--lr) bg-(--lb) px-2 font-semibold text-(--lt) text-[11px] dark:border-(--lrd) dark:bg-(--lbd) dark:text-(--ltd)"
							>
								<span
									aria-hidden
									className="size-1.5 shrink-0 rounded-full bg-(--ld)"
								/>
								<span className="truncate">{label.name}</span>
							</span>
						))}
						{hiddenLabelCount > 0 ? (
							<span className="shrink-0 text-[11px] text-text-soft-400">
								+{hiddenLabelCount}
							</span>
						) : null}
					</span>
				) : null}

				{/* Failed label on right-hand side */}
				{isFailed ? (
					<span className="mt-0.5 ml-2 inline-flex h-5 shrink-0 items-center gap-1 rounded-[5px] bg-red-500/10 px-1.5 py-0.5 font-medium text-[11px] text-red-600 ring-1 ring-red-500/25 ring-inset dark:bg-red-950/40 dark:text-red-400 dark:ring-red-500/30">
						<span className="size-1.5 shrink-0 rounded-full bg-red-500" />
						Failed
					</span>
				) : null}

				{/* Date/Time */}
				<span className="mt-0.5 ml-2 w-18 shrink-0 whitespace-nowrap text-right font-normal text-[12.5px] text-text-soft-400 tabular-nums leading-5">
					{formatReceivedAt(thread.receivedAt)}
				</span>
			</div>
		);
	},
);

InboxThreadRow.displayName = "InboxThreadRow";
