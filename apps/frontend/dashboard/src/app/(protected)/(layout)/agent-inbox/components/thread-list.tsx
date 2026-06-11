"use client";

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

function senderInitials(thread: InboundThread): string {
	if (thread.from.name) {
		const parts = thread.from.name.split(" ");
		return (
			(parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "")
		).toUpperCase();
	}
	return thread.from.email[0]?.toUpperCase() ?? "?";
}

function getSenderGradient(name: string): string {
	const gradients = [
		"from-[#ff416c] to-[#ff4b2b]", // Unity Collective: vibrant red-orange
		"from-[#f37335] to-[#fdbb2d]", // Synergy Squad: orange-yellow
		"from-[#e100ff] to-[#7f00ff]", // Collaborative Crew: pink-purple
		"from-[#11998e] to-[#38ef7d]", // Innovative Minds: teal-green
		"from-[#fc466b] to-[#3f5efb]", // Empowerment Team: purple-pink
		"from-[#00c6ff] to-[#0072ff]", // Inspiration Hub: blue-cyan
		"from-[#3a7bd5] to-[#3a6073]", // Dynamic Teamwork: deep blue
		"from-[#ff9966] to-[#ff5e62]", // Creative Collaborators: peach-rose
	];
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	}
	const index = Math.abs(hash) % gradients.length;
	return gradients[index] || "from-[#ff416c] to-[#ff4b2b]";
}

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
						<div key={group.key} className="flex flex-col gap-2.5">
							{/* Group Header */}
							<div className="flex select-none items-center justify-between px-1 py-1 text-text-sub-500">
								<span className="font-semibold text-[13px] text-neutral-500 uppercase tracking-wide dark:text-neutral-400">
									{group.title}
								</span>
							</div>

							{/* Group Threads List */}
							{!isCollapsed && (
								<div className="flex flex-col gap-2.5">
									{group.threads.map((thread) => {
										const isSelected = selectedId === thread.id;
										const isUnread = thread.unread;

										return (
											<div
												key={thread.id}
												onClick={() => onSelect(thread.id)}
												className={cn(
													"group/card relative flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 text-left transition-all duration-200",
													isSelected
														? "border-neutral-900 bg-white shadow-sm dark:border-white dark:bg-neutral-900"
														: isUnread
															? "border-neutral-200 bg-neutral-100/50 hover:bg-neutral-100/80 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:bg-neutral-900"
															: "border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-850 dark:bg-transparent dark:hover:bg-neutral-900/20",
												)}
											>
												<div className="flex items-start gap-3">
													{/* Gradient Avatar */}
													<div
														className={cn(
															"flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr font-medium text-white text-xs shadow-sm",
															getSenderGradient(
																thread.from.name ?? thread.from.email,
															),
														)}
													>
														{senderInitials(thread)}
													</div>

													{/* Details Column */}
													<div className="flex min-w-0 flex-1 flex-col gap-1">
														{/* Sender & Time row */}
														<div className="flex items-center justify-between gap-2">
															<span
																className={cn(
																	"truncate text-neutral-850 text-sm tracking-tight dark:text-neutral-200",
																	isUnread
																		? "font-semibold"
																		: "font-medium text-neutral-600 dark:text-neutral-400",
																)}
															>
																{thread.from.name ?? thread.from.email}
															</span>
															<div className="flex shrink-0 items-center gap-2">
																{isUnread && (
																	<span className="h-2 w-2 rounded-full bg-blue-600" />
																)}
																<span className="font-medium text-[11px] text-neutral-400 tabular-nums dark:text-neutral-500">
																	{dayjs(thread.receivedAt).format("HH:mm")}
																</span>
															</div>
														</div>

														{/* Subject */}
														<div
															className={cn(
																"truncate text-neutral-900 text-sm dark:text-neutral-100",
																isUnread ? "font-semibold" : "font-medium",
															)}
														>
															{thread.subject}
														</div>

														{/* Snippet */}
														<div className="truncate text-neutral-500 text-xs leading-relaxed dark:text-neutral-400">
															{thread.preview}
														</div>

														{/* Badges and Actions Row */}
														<div className="mt-1 flex min-h-[22px] items-center justify-between gap-2">
															{thread.attachments &&
															thread.attachments.length > 0 ? (
																<div className="flex min-w-0 shrink-0 flex-wrap items-center gap-1.5">
																	{thread.attachments
																		.slice(0, 2)
																		.map((att, idx) => (
																			<div
																				key={att.name + idx}
																				className="flex items-center gap-1 rounded-[8px] border border-neutral-200 bg-white px-2.5 py-1 font-medium text-[10px] text-neutral-600 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
																			>
																				<Icon
																					name="file-text"
																					className="h-3.5 w-3.5 shrink-0 text-neutral-400"
																				/>
																				<span className="max-w-[100px] truncate">
																					{att.name}
																				</span>
																			</div>
																		))}
																	{thread.attachments.length > 2 && (
																		<span className="rounded-[8px] border border-neutral-200 bg-white px-2 py-1 font-medium text-[10px] text-neutral-500 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
																			+{thread.attachments.length - 2}
																		</span>
																	)}
																</div>
															) : (
																<div className="flex min-w-0 shrink-0 flex-wrap items-center gap-1.5">
																	{["TAG #1", "TAG #2", "TAG #3"]
																		.slice(
																			0,
																			thread.id === "in-005" ||
																				thread.id === "in-011"
																				? 1
																				: thread.id === "in-003"
																					? 2
																					: 3,
																		)
																		.map((tag) => (
																			<span
																				key={tag}
																				className="rounded-[4px] bg-neutral-100 px-1.5 py-0.5 font-bold text-[9px] text-neutral-400 tracking-wider dark:bg-neutral-900"
																			>
																				{tag}
																			</span>
																		))}
																</div>
															)}

															{/* Quick actions (visible on hover) */}
															<div className="invisible flex shrink-0 items-center gap-1 bg-transparent opacity-0 transition-all duration-150 group-hover/card:visible group-hover/card:opacity-100">
																<button
																	type="button"
																	title={
																		thread.unread
																			? "Mark as Handled"
																			: "Mark as Active"
																	}
																	onClick={(e) => {
																		e.stopPropagation();
																		handleToggleRead(thread.id, thread.unread);
																	}}
																	className="rounded p-1 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-white/10"
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
																	className="rounded p-1 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-error-base dark:hover:bg-white/10"
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
																	className="rounded p-1 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-error-base dark:hover:bg-white/10"
																>
																	<Icon name="trash" className="h-3.5 w-3.5" />
																</button>
															</div>
														</div>
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
