"use client";

import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { InboundThread } from "../mock-data";
import { useAgentInbox } from "./agent-inbox-provider";
import { toast } from "sonner";
import { useState } from "react";

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
	const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
		Today: false,
		Yesterday: false,
		Older: false,
	});

	const toggleGroup = (key: string) => {
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
		{ key: "Yesterday" as const, title: "Yesterday", threads: grouped.Yesterday || [] },
		{ key: "Older" as const, title: "Older", threads: grouped.Older || [] },
	].filter((g) => g.threads.length > 0);

	if (threads.length === 0) {
		return (
			<div className="flex-1 overflow-y-auto min-h-0">
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
		<div className="w-full h-full overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 text-paragraph-sm dark:border-stroke-soft-100/40 flex flex-col">
			<div className="flex-1 overflow-y-auto min-h-0 p-3 flex flex-col gap-4 bg-neutral-50/20 dark:bg-transparent">
				{groups.map((group) => {
					const isCollapsed = collapsedGroups[group.key];
					return (
						<div key={group.key} className="flex flex-col gap-2.5">
							{/* Collapsible Group Header */}
							<div
								onClick={() => toggleGroup(group.key)}
								className="flex items-center justify-between px-1 py-1 cursor-pointer select-none text-text-sub-500 hover:text-text-strong-950 transition-colors"
							>
								<span className="font-semibold text-[13px] tracking-wide uppercase text-neutral-500 dark:text-neutral-400">
									{group.title}
								</span>
								<div className="flex items-center gap-1.5 text-neutral-400 dark:text-neutral-500">
									<Icon name="mail" className="h-3.5 w-3.5" />
									<span className="text-xs font-semibold tabular-nums">
										{group.threads.length}
									</span>
									<Icon
										name="chevron-down"
										className={cn(
											"h-4 w-4 transition-transform duration-200",
											!isCollapsed && "rotate-180",
										)}
									/>
								</div>
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
													"group/card flex flex-col gap-2 rounded-2xl border p-4 transition-all duration-200 cursor-pointer text-left relative",
													isSelected
														? "border-neutral-900 bg-white shadow-sm dark:border-white dark:bg-neutral-900"
														: isUnread
															? "border-neutral-200 bg-neutral-100/50 hover:bg-neutral-100/80 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:bg-neutral-900"
															: "border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-850 dark:bg-transparent dark:hover:bg-neutral-900/20",
												)}
											>
												{/* Sender, dot & date row */}
												<div className="flex items-center justify-between">
													<div className="flex items-center gap-3 min-w-0">
														{/* Gradient Avatar */}
														<div
															className={cn(
																"flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white font-medium text-xs bg-gradient-to-tr shadow-sm",
																getSenderGradient(
																	thread.from.name ?? thread.from.email,
																),
															)}
														>
															{senderInitials(thread)}
														</div>
														{/* Sender name */}
														<span
															className={cn(
																"truncate text-sm tracking-tight text-neutral-850 dark:text-neutral-200",
																isUnread
																	? "font-semibold"
																	: "font-medium text-neutral-600 dark:text-neutral-400",
															)}
														>
															{thread.from.name ?? thread.from.email}
														</span>
													</div>

													<div className="flex items-center gap-2 shrink-0">
														{isUnread && (
															<span className="h-2 w-2 rounded-full bg-blue-600" />
														)}
														<span className="text-[11px] text-neutral-400 dark:text-neutral-500 font-medium tabular-nums">
															{dayjs(thread.receivedAt).format("HH:mm")}
														</span>
													</div>
												</div>

												{/* Subject */}
												<div
													className={cn(
														"truncate text-sm text-neutral-900 dark:text-neutral-100",
														isUnread ? "font-semibold" : "font-medium",
													)}
												>
													{thread.subject}
												</div>

												{/* Snippet */}
												<div className="truncate text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
													{thread.preview}
												</div>

												{/* Badges/Pills Row */}
												<div className="flex items-center justify-between mt-0.5 min-h-[22px]">
													{thread.attachments &&
													thread.attachments.length > 0 ? (
														<div className="flex items-center gap-1.5 shrink-0 flex-wrap min-w-0">
															{thread.attachments
																.slice(0, 2)
																.map((att, idx) => (
																	<div
																		key={att.name + idx}
																		className="flex items-center gap-1 px-2.5 py-1 rounded-[8px] border border-neutral-200 bg-white text-[10px] font-medium text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 shadow-sm"
																	>
																		<Icon
																			name="file-text"
																			className="h-3.5 w-3.5 shrink-0 text-neutral-400"
																		/>
																		<span className="truncate max-w-[100px]">
																			{att.name}
																		</span>
																	</div>
																))}
															{thread.attachments.length > 2 && (
																<span className="px-2 py-1 rounded-[8px] border border-neutral-200 bg-white text-[10px] font-medium text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 shadow-sm">
																	+{thread.attachments.length - 2}
																</span>
															)}
														</div>
													) : (
														<div className="flex items-center gap-1.5 shrink-0 flex-wrap min-w-0">
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
																		className="px-1.5 py-0.5 rounded-[4px] bg-neutral-100 dark:bg-neutral-900 text-[9px] font-bold text-neutral-400 tracking-wider"
																	>
																		{tag}
																	</span>
																))}
														</div>
													)}

													{/* Quick actions (visible on hover) */}
													<div className="opacity-0 invisible group-hover/card:visible group-hover/card:opacity-100 transition-all duration-150 flex items-center gap-1 shrink-0 bg-transparent">
														<button
															title={
																thread.unread
																	? "Mark as Handled"
																	: "Mark as Active"
															}
															onClick={(e) => {
																e.stopPropagation();
																handleToggleRead(thread.id, thread.unread);
															}}
															className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-500 hover:text-neutral-800 transition-colors"
														>
															<Icon
																name="check-circle"
																className="h-3.5 w-3.5"
															/>
														</button>
														<button
															title="Mark as Spam"
															onClick={(e) => {
																e.stopPropagation();
																handleMarkSpam(thread.id);
															}}
															className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-500 hover:text-error-base transition-colors"
														>
															<Icon
																name="cross-circle"
																className="h-3.5 w-3.5"
															/>
														</button>
														<button
															title="Delete Message"
															onClick={(e) => {
																e.stopPropagation();
																handleDelete(thread.id);
															}}
															className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-500 hover:text-error-base transition-colors"
														>
															<Icon name="trash" className="h-3.5 w-3.5" />
														</button>
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
