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

const StarIcon = ({ className }: { className?: string }) => (
	<svg
		className={className}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.5"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
	</svg>
);

const CheckboxIcon = ({ className }: { className?: string }) => (
	<svg
		className={className}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.5"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
	</svg>
);

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

	return (
		<div className="w-full h-full overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 text-paragraph-sm dark:border-stroke-soft-100/40 flex flex-col">
			<div className="divide-y divide-stroke-soft-100/60 overflow-y-auto dark:divide-stroke-soft-100/30 flex-1 min-h-0">
				{threads.length === 0 ? (
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
				) : (
					threads.map((thread) => {
						const isSelected = selectedId === thread.id;
						return (
							<div
								key={thread.id}
								onClick={() => onSelect(thread.id)}
								className={cn(
									"group flex w-full items-start gap-3 border-b last:border-b-0 border-stroke-soft-100/60 dark:border-stroke-soft-100/30 px-4 py-3 hover:bg-bg-weak-50/50 transition-all cursor-pointer text-left relative",
									thread.unread
										? "bg-bg-white-0 dark:bg-bg-white-0/5"
										: "bg-bg-weak-50/10 dark:bg-bg-weak-50/5",
									isSelected && "bg-bg-weak-50/80 dark:bg-bg-weak-50/20",
								)}
							>
								{/* Left selection helper (Star/Checkbox) */}
								<div className="flex flex-col items-center gap-2 mt-0.5 shrink-0">
									<CheckboxIcon className="h-4 w-4 text-text-soft-400 hover:text-text-sub-600 transition-colors" />
									<StarIcon className="h-4 w-4 text-text-soft-400 hover:text-yellow-500 transition-colors" />
								</div>

								{/* Main Content Area */}
								<div className="flex-1 min-w-0 flex flex-col gap-1">
									{/* Sender + Date */}
									<div className="flex items-center justify-between gap-2">
										<span
											className={cn(
												"truncate text-label-sm",
												thread.unread
													? "font-semibold text-text-strong-950"
													: "text-text-sub-600",
											)}
										>
											{thread.from.name ?? thread.from.email}
										</span>
										<span className="text-[11px] text-text-soft-400 shrink-0 tabular-nums">
											{dayjs(thread.receivedAt).format("h:mm A")}
										</span>
									</div>

									{/* Subject */}
									<div className="truncate text-label-sm font-medium text-text-strong-950">
										{thread.subject}
									</div>

									{/* Snippet */}
									<div className="truncate text-label-xs text-text-soft-400 max-h-4">
										{thread.preview}
									</div>

									{/* Bottom Meta & Hover Actions Row */}
									<div className="flex items-center justify-between mt-1 min-h-[20px]">
										{/* Attachments Pills */}
										<div className="flex items-center gap-1.5 shrink-0 flex-wrap min-w-0 flex-1 mr-2">
											{thread.attachments && thread.attachments.length > 0 ? (
												<>
													{thread.attachments.slice(0, 1).map((att) => (
														<div
															key={att.name}
															className="flex items-center gap-1 px-1 py-0.5 rounded bg-bg-weak-50 ring-1 ring-stroke-soft-100 text-[9px] text-text-sub-600 max-w-[100px] truncate"
														>
															<Icon
																name="file-text"
																className="h-2.5 w-2.5 shrink-0 text-text-soft-400"
															/>
															<span className="truncate">{att.name}</span>
														</div>
													))}
													{thread.attachments.length > 1 && (
														<span className="text-[9px] text-text-soft-400">
															+{thread.attachments.length - 1}
														</span>
													)}
												</>
											) : thread.entityTag ? (
												<Badge.Root size="small" variant="lighter" color="gray">
													{thread.entityTag}
												</Badge.Root>
											) : null}
										</div>

										{/* Triage Actions (visible on hover) */}
										<div className="opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-all duration-150 flex items-center gap-1 shrink-0 bg-transparent">
											<button
												title={thread.unread ? "Mark as Handled" : "Mark as Active"}
												onClick={(e) => {
													e.stopPropagation();
													handleToggleRead(thread.id, thread.unread);
												}}
												className="p-1 rounded hover:bg-bg-weak-100 dark:hover:bg-white/10 text-text-sub-600 hover:text-text-strong-950 transition-colors"
											>
												<Icon name="check-circle" className="h-3.5 w-3.5" />
											</button>
											<button
												title="Mark as Spam"
												onClick={(e) => {
													e.stopPropagation();
													handleMarkSpam(thread.id);
												}}
												className="p-1 rounded hover:bg-bg-weak-100 dark:hover:bg-white/10 text-text-sub-600 hover:text-error-base transition-colors"
											>
												<Icon name="cross-circle" className="h-3.5 w-3.5" />
											</button>
											<button
												title="Delete Message"
												onClick={(e) => {
													e.stopPropagation();
													handleDelete(thread.id);
												}}
												className="p-1 rounded hover:bg-bg-weak-100 dark:hover:bg-white/10 text-text-sub-600 hover:text-error-base transition-colors"
											>
												<Icon name="trash" className="h-3.5 w-3.5" />
											</button>
										</div>
									</div>
								</div>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
};
