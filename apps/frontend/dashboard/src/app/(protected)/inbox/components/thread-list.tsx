"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { toast } from "sonner";
import type { InboundThread } from "../types";
import { useAgentInbox } from "./agent-inbox-provider";

dayjs.extend(relativeTime);

// Derive the left gutter color and actor pill from thread status
const getActorInfo = (
	thread: InboundThread,
): { gutterColor: string; tag: string | null; tagStyle: string } => {
	if (thread.direction === "outbound") {
		return {
			gutterColor: "bg-emerald-500 dark:bg-emerald-600",
			tag: "via you",
			tagStyle:
				"bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/40",
		};
	}
	switch (thread.status) {
		case "needs_approval":
			return {
				gutterColor: "bg-amber-500 dark:bg-amber-600",
				tag: "needs you",
				tagStyle:
					"bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800/40",
			};
		case "handled":
		case "parsing":
		case "new":
		default:
			return {
				gutterColor: "bg-blue-500 dark:bg-blue-600",
				tag: "via agent",
				tagStyle:
					"bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800/40",
			};
	}
};

const formatReceivedAt = (dateStr: string, isFirstToday: boolean) => {
	const date = dayjs(dateStr);
	const now = dayjs();
	if (date.isSame(now, "day")) {
		return isFirstToday
			? `Today, ${date.format("h:mm A")}`
			: date.format("h:mm A");
	}
	if (date.isSame(now.subtract(1, "day"), "day")) {
		return "Yesterday";
	}
	if (date.isAfter(now.subtract(7, "day"))) {
		return date.format("ddd");
	}
	return date.format("MMM D");
};

interface ThreadListProps {
	threads: InboundThread[];
	selectedId: string | null;
	onSelect: (id: string) => void;
	emptyMessage?: string;
	hasFilters?: boolean;
	onClearFilters?: () => void;
}

export const ThreadList = ({
	threads,
	selectedId,
	onSelect,
	emptyMessage = "No messages in this filter",
	hasFilters = false,
	onClearFilters,
}: ThreadListProps) => {
	const { markMessageRead, deleteMessage, markMessageSpam } = useAgentInbox();

	const handleToggleRead = async (id: string, currentlyUnread: boolean) => {
		try {
			await markMessageRead(id, currentlyUnread);
			toast.success(currentlyUnread ? "Marked as Handled" : "Marked as Active");
		} catch (err: any) {
			toast.error(err.message || "Failed to update status");
		}
	};

	const handleMarkSpam = async (id: string) => {
		try {
			await markMessageSpam(id, true);
			toast.success("Marked as Spam");
		} catch (err: any) {
			toast.error(err.message || "Failed to mark as spam");
		}
	};

	const handleDelete = async (id: string) => {
		if (confirm("Are you sure you want to delete this message?")) {
			try {
				await deleteMessage(id);
				toast.success("Message deleted");
			} catch (err: any) {
				toast.error(err.message || "Failed to delete message");
			}
		}
	};

	if (threads.length === 0) {
		return (
			<div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">
				<div className="flex flex-col items-center bg-bg-soft-200/10 px-6 py-12 text-center dark:bg-transparent">
					<div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/50">
						<Icon
							name={hasFilters ? "search" : "inbox"}
							className="h-5 w-5 text-text-sub-600"
						/>
					</div>
					<h3 className="mb-2 font-semibold text-base text-text-strong-950 dark:text-white">
						{hasFilters ? "No results found" : "No messages yet"}
					</h3>
					<p className="mx-auto mb-5 max-w-sm text-balance text-text-sub-600 text-xs dark:text-neutral-400">
						{emptyMessage}
					</p>
					{hasFilters && onClearFilters && (
						<button
							type="button"
							onClick={onClearFilters}
							className="inline-flex items-center gap-1.5 rounded-lg border border-stroke-soft-100 bg-white px-3 py-1.5 font-semibold text-text-sub-600 text-xs shadow-sm transition-all hover:bg-bg-weak-50 dark:border-stroke-soft-100/30 dark:bg-neutral-900 dark:text-neutral-300"
						>
							<Icon name="minus-circle" className="h-4 w-4" />
							Clear filters
						</button>
					)}
				</div>
			</div>
		);
	}

	// Check if any thread is from today so we can flag the first one for "Today, h:mm AM/PM" formatting
	let foundFirstToday = false;

	return (
		<div className="scrollbar-hide flex h-full w-full flex-col overflow-hidden text-paragraph-sm">
			<div className="scrollbar-hide flex min-h-0 flex-1 flex-col overflow-y-auto">
				<div className="flex flex-col bg-transparent dark:bg-transparent">
					{threads.map((thread) => {
						const isSelected = selectedId === thread.id;
						const isUnread = thread.unread;
						const actorInfo = getActorInfo(thread);

						const dateObj = dayjs(thread.receivedAt);
						const isToday = dateObj.isSame(dayjs(), "day");
						let isFirstToday = false;
						if (isToday && !foundFirstToday) {
							isFirstToday = true;
							foundFirstToday = true;
						}

						return (
							<div
								key={thread.id}
								onClick={() => onSelect(thread.id)}
								className={cn(
									"group/card relative flex cursor-pointer flex-col gap-1 border-l-[3px] py-3.5 pr-4 pl-7 text-left transition-all duration-200",
									isSelected
										? "border-primary-base bg-[#FCF5EE] dark:bg-amber-950/20"
										: "border-transparent bg-transparent hover:bg-[#FCF5EE]/40 dark:bg-transparent dark:hover:bg-white/[0.01]",
								)}
							>
								{/* Actor status vertical pill - centered, rounded */}
								<div
									className={cn(
										"absolute top-3 bottom-3 left-3 w-1 rounded-full",
										actorInfo.gutterColor,
									)}
								/>

								{/* Details Block */}
								<div className="flex min-w-0 flex-1 flex-col gap-0.5">
									{/* Sender & Time row */}
									<div className="flex items-center justify-between gap-2">
										<span
											className={cn(
												"truncate text-xs tracking-tight",
												isUnread
													? "font-semibold text-text-strong-950 dark:text-white"
													: "font-medium text-text-sub-600 dark:text-neutral-400",
											)}
										>
											{thread.from.name
												? `${thread.from.name}${thread.direction === "outbound" ? ", You" : ""}`
												: thread.from.email}
										</span>
										<div className="relative flex shrink-0 items-center">
											{/* Time & Unread dot */}
											<div className="flex items-center gap-2 transition-opacity duration-150 group-hover/card:pointer-events-none group-hover/card:opacity-0">
												{isUnread && (
													<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-base" />
												)}
												<span className="font-medium text-[10px] text-text-soft-400 tabular-nums dark:text-neutral-500">
													{formatReceivedAt(thread.receivedAt, isFirstToday)}
												</span>
											</div>

											{/* Quick actions (visible on hover) */}
											<div className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-0 flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover/card:pointer-events-auto group-hover/card:opacity-100">
												<button
													type="button"
													title="Delete Message"
													onClick={(e) => {
														e.stopPropagation();
														handleDelete(thread.id);
													}}
													className="flex h-7 w-7 items-center justify-center rounded-lg border border-stroke-soft-100 bg-white text-text-soft-400 transition-all hover:bg-bg-weak-50 hover:text-error-base dark:border-stroke-soft-100/30 dark:bg-neutral-900 dark:hover:text-red-400"
												>
													<Icon name="trash" className="h-3.5 w-3.5" />
												</button>
											</div>
										</div>
									</div>

									{/* Subject */}
									<div
										className={cn(
											"truncate text-xs",
											isUnread
												? "font-semibold text-text-strong-950 dark:text-white"
												: "font-medium text-text-sub-600 dark:text-neutral-300",
										)}
									>
										{thread.subject}
									</div>

									{/* Snippet */}
									<div className="truncate text-[11px] text-text-soft-400 leading-relaxed dark:text-neutral-400">
										{thread.preview}
									</div>

									{/* Actor tag pill */}
									{actorInfo.tag && (
										<div className="mt-1 flex items-center gap-1.5">
											<span
												className={cn(
													"inline-flex items-center rounded px-1.5 py-0.5 font-medium font-mono text-[9px] leading-none tracking-wide",
													actorInfo.tagStyle,
												)}
											>
												{actorInfo.tag}
											</span>
										</div>
									)}

									{/* Attachments Row */}
									{thread.attachments && thread.attachments.length > 0 && (
										<div className="mt-1 flex min-h-[20px] items-center gap-1.5">
											<div className="flex min-w-0 shrink-0 flex-wrap items-center gap-1.5">
												{thread.attachments.slice(0, 2).map((att, idx) => (
													<div
														key={att.name + idx}
														className="flex items-center gap-1 rounded border border-stroke-soft-100 bg-bg-white-0 px-1.5 py-0.5 font-medium text-[9px] text-text-sub-600 shadow-sm dark:border-stroke-soft-100/30 dark:bg-neutral-800 dark:text-neutral-300"
													>
														<Icon
															name="file-text"
															className="h-3 w-3 shrink-0 text-text-soft-400"
														/>
														<span className="max-w-[80px] truncate">
															{att.name}
														</span>
													</div>
												))}
												{thread.attachments.length > 2 && (
													<span className="rounded border border-stroke-soft-100 bg-bg-white-0 px-1.5 py-0.5 font-medium text-[9px] text-text-soft-400 shadow-sm dark:border-stroke-soft-100/30 dark:bg-neutral-800 dark:text-neutral-400">
														+{thread.attachments.length - 2}
													</span>
												)}
											</div>
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};
