"use client";

import {
	getAvatarGradient,
	getAvatarInitial,
} from "@fe/dashboard/utils/avatar";
import * as Avatar from "@reloop/ui/avatar";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState } from "react";
import { toast } from "sonner";
import type { InboundThread } from "../mock-data";
import { useAgentInbox } from "./agent-inbox-provider";

dayjs.extend(relativeTime);

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
	const [collapsedGroups, setCollapsedGroups] = useState<
		Record<string, boolean>
	>({
		Today: false,
		Yesterday: false,
		Older: false,
	});

	const _toggleGroup = (key: string) => {
		setCollapsedGroups((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};

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

	// Group threads by Today, Yesterday, and Older
	const grouped = threads.reduce(
		(acc, thread) => {
			const date = dayjs(thread.receivedAt);
			const today = dayjs();
			let groupKey: "Today" | "Yesterday" | "Older" = "Older";

			if (date.isSame(today, "day")) {
				groupKey = "Today";
			} else if (date.isSame(today.subtract(1, "day"), "day")) {
				groupKey = "Yesterday";
			}

			if (!acc[groupKey]) acc[groupKey] = [];
			acc[groupKey].push(thread);
			return acc;
		},
		{} as Record<"Today" | "Yesterday" | "Older", InboundThread[]>,
	);

	const groups: {
		key: "Today" | "Yesterday" | "Older";
		title: string;
		threads: InboundThread[];
	}[] = [
		{ key: "Today" as const, title: "Today", threads: grouped.Today || [] },
		{
			key: "Yesterday" as const,
			title: "Yesterday",
			threads: grouped.Yesterday || [],
		},
		{ key: "Older" as const, title: "Older", threads: grouped.Older || [] },
	].filter((g) => g.threads.length > 0);

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
					<h3 className="mb-2 font-semibold text-lg text-text-strong-950">
						{hasFilters ? "No results found" : "No messages yet"}
					</h3>
					<p className="mx-auto mb-5 max-w-sm text-balance font-medium text-[12px] text-text-sub-600">
						{emptyMessage}
					</p>
					{hasFilters && onClearFilters && (
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="xsmall"
							onClick={onClearFilters}
						>
							<Icon name="minus-circle" className="h-4 w-4" />
							Clear filters
						</Button.Root>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="scrollbar-hide flex h-full w-full flex-col overflow-hidden text-paragraph-sm">
			<div className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4">
				{groups.map((group) => {
					const isCollapsed = collapsedGroups[group.key];
					return (
						<div key={group.key} className="flex flex-col gap-1.5 pt-3 pb-1">
							{/* Group Header */}
							<div className="flex select-none items-center justify-between px-1 text-text-soft-400">
								<span className="font-semibold text-[10px] uppercase tracking-wider">
									{group.title}
								</span>
							</div>

							{/* Group Threads List */}
							{!isCollapsed && (
								<div className="divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/30 dark:border-stroke-soft-100/30">
									{group.threads.map((thread) => {
										const isSelected = selectedId === thread.id;
										const isUnread = thread.unread;

										return (
											<div
												key={thread.id}
												onClick={() => onSelect(thread.id)}
												className={cn(
													"group/card relative flex cursor-pointer flex-col gap-1.5 px-4 py-3.5 text-left transition-all duration-200",
													isSelected
														? "bg-bg-weak-50/70 dark:bg-white/[0.04]"
														: "bg-bg-white-0 hover:bg-bg-weak-50/40 dark:bg-transparent dark:hover:bg-white/[0.01]",
												)}
											>
												{isSelected && (
													<div className="absolute top-0 bottom-0 left-0 w-[3px] bg-primary-base" />
												)}
												<div className="flex items-start gap-3">
													{/* Gradient Avatar & Checkbox State */}
													<div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
														{/* Avatar (visible normally, hidden on hover/selection) */}
														<div
															className={cn(
																"absolute inset-0 flex items-center justify-center transition-all duration-150",
																isSelected
																	? "pointer-events-none scale-0 opacity-0"
																	: "scale-100 opacity-100 group-hover/card:pointer-events-none group-hover/card:scale-0 group-hover/card:opacity-0",
															)}
														>
															<Avatar.Root size="32" color="gray">
																<Avatar.Image asChild>
																	<div
																		className={cn(
																			"flex h-full w-full items-center justify-center rounded-full font-semibold text-white text-xs uppercase tracking-wide shadow-sm",
																			getAvatarGradient(thread.from.email),
																		)}
																	>
																		{getAvatarInitial(
																			thread.from.name ?? null,
																			thread.from.email,
																		)}
																	</div>
																</Avatar.Image>
															</Avatar.Root>
														</div>

														{/* Checkbox (visible on hover/selection) */}
														<div
															className={cn(
																"absolute inset-0 flex items-center justify-center transition-all duration-150",
																isSelected
																	? "scale-100 opacity-100"
																	: "scale-0 opacity-0 group-hover/card:scale-100 group-hover/card:opacity-100",
															)}
														>
															<div className="flex h-5 w-5 items-center justify-center rounded border border-neutral-300 bg-white text-transparent transition-all duration-150 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900" />
														</div>
													</div>

													{/* Details Column */}
													<div className="flex min-w-0 flex-1 flex-col gap-1">
														{/* Sender & Time row */}
														<div className="flex items-center justify-between gap-2">
															<span
																className={cn(
																	"truncate text-sm tracking-tight",
																	isUnread
																		? "font-semibold text-text-strong-950"
																		: "font-medium text-text-sub-600 dark:text-neutral-400",
																)}
															>
																{thread.from.name ?? thread.from.email}
															</span>
															<div className="relative flex shrink-0 items-center">
																{/* Time & Unread dot */}
																<div className="flex items-center gap-2 transition-opacity duration-150 group-hover/card:pointer-events-none group-hover/card:opacity-0">
																	{isUnread && (
																		<span className="h-2 w-2 rounded-full bg-primary-base" />
																	)}
																	<span className="font-medium text-[11px] text-text-soft-400 tabular-nums">
																		{dayjs(thread.receivedAt).format("HH:mm")}
																	</span>
																</div>

																{/* Quick actions (visible on hover) */}
																<div className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-0 flex items-center gap-1 opacity-0 transition-all duration-150 group-hover/card:pointer-events-auto group-hover/card:opacity-100">
																	<button
																		type="button"
																		title={
																			thread.unread
																				? "Mark as Handled"
																				: "Mark as Active"
																		}
																		onClick={(e) => {
																			e.stopPropagation();
																			handleToggleRead(
																				thread.id,
																				thread.unread,
																			);
																		}}
																		className="rounded p-0.5 text-text-soft-400 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:hover:bg-white/10"
																	>
																		<Icon
																			name="check-circle"
																			className="h-3.5 w-3.5"
																		/>
																	</button>
																	<button
																		type="button"
																		title="Mark as Spam"
																		onClick={(e) => {
																			e.stopPropagation();
																			handleMarkSpam(thread.id);
																		}}
																		className="rounded p-0.5 text-text-soft-400 transition-colors hover:bg-bg-weak-50 hover:text-error-base dark:hover:bg-white/10"
																	>
																		<Icon
																			name="cross-circle"
																			className="h-3.5 w-3.5"
																		/>
																	</button>
																	<button
																		type="button"
																		title="Delete Message"
																		onClick={(e) => {
																			e.stopPropagation();
																			handleDelete(thread.id);
																		}}
																		className="rounded p-0.5 text-text-soft-400 transition-colors hover:bg-bg-weak-50 hover:text-error-base dark:hover:bg-white/10"
																	>
																		<Icon
																			name="trash"
																			className="h-3.5 w-3.5"
																		/>
																	</button>
																</div>
															</div>
														</div>

														{/* Subject */}
														<div
															className={cn(
																"truncate text-sm",
																isUnread
																	? "font-semibold text-text-strong-950"
																	: "font-medium text-text-sub-600 dark:text-neutral-350",
															)}
														>
															{thread.subject}
														</div>

														{/* Snippet */}
														<div className="truncate text-text-soft-400 text-xs leading-relaxed">
															{thread.preview}
														</div>

														{/* Attachments Row */}
														{thread.attachments &&
															thread.attachments.length > 0 && (
																<div className="mt-1 flex min-h-[22px] items-center gap-1.5">
																	<div className="flex min-w-0 shrink-0 flex-wrap items-center gap-1.5">
																		{thread.attachments
																			.slice(0, 2)
																			.map((att, idx) => (
																				<div
																					key={att.name + idx}
																					className="flex items-center gap-1 rounded-[6px] border border-stroke-soft-100 bg-bg-white-0 px-2 py-0.5 font-medium text-[10px] text-text-sub-600 shadow-sm dark:border-stroke-soft-100/30 dark:bg-bg-weak-50/20"
																				>
																					<Icon
																						name="file-text"
																						className="h-3.5 w-3.5 shrink-0 text-text-soft-400"
																					/>
																					<span className="max-w-[100px] truncate">
																						{att.name}
																					</span>
																				</div>
																			))}
																		{thread.attachments.length > 2 && (
																			<span className="rounded-[6px] border border-stroke-soft-100 bg-bg-white-0 px-2 py-0.5 font-medium text-[10px] text-text-soft-400 shadow-sm dark:border-stroke-soft-100/30 dark:bg-bg-weak-50/20">
																				+{thread.attachments.length - 2}
																			</span>
																		)}
																	</div>
																</div>
															)}
													</div>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};
