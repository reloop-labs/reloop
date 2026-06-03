"use client";

import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import type { InboundThread, InboundThreadStatus } from "../mock-data";

dayjs.extend(relativeTime);

const statusBadge: Record<
	InboundThreadStatus,
	{ label: string; color: "blue" | "yellow" | "purple" | "green" | "red" }
> = {
	new: { label: "New", color: "blue" },
	parsing: { label: "Parsing", color: "yellow" },
	needs_approval: { label: "Needs approval", color: "purple" },
	handled: { label: "Handled", color: "green" },
	blocked: { label: "Blocked", color: "red" },
};

function senderInitials(thread: InboundThread): string {
	if (thread.from.name) {
		const parts = thread.from.name.split(" ");
		return (
			(parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? parts[0]?.[1] ?? "")
		).toUpperCase();
	}
	return thread.from.email[0]?.toUpperCase() ?? "?";
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
	return (
		<div
			className="w-full overflow-hidden rounded-[14px] border border-stroke-soft-100 bg-bg-white-0 text-paragraph-sm dark:border-stroke-soft-100/40"
			style={{ maxHeight: "calc(100vh - 220px)" }}
		>
			<div className="divide-y divide-stroke-soft-100 overflow-y-auto dark:divide-stroke-soft-100/50">
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
						const status = statusBadge[thread.status];
						return (
							<button
								key={thread.id}
								type="button"
								onClick={() => onSelect(thread.id)}
								className={cn(
									"flex w-full gap-3 border-l-2 px-4 py-2.5 text-left transition-colors",
									isSelected
										? "border-l-primary-base bg-bg-weak-50 dark:bg-bg-weak-50/30"
										: "border-l-transparent hover:bg-bg-weak-50/60 dark:hover:bg-white/[0.03]",
								)}
							>
								<div
									className={cn(
										"flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-label-xs font-medium",
										thread.unread
											? "bg-primary-base text-static-white"
											: "bg-bg-weak-50 text-text-sub-600 dark:bg-white/10",
									)}
								>
									{senderInitials(thread)}
								</div>
								<div className="min-w-0 flex-1">
									<div className="flex items-start justify-between gap-2">
										<span
											className={cn(
												"truncate text-label-sm",
												thread.unread
													? "font-semibold text-text-strong-950"
													: "text-text-strong-950",
											)}
										>
											{thread.from.name ?? thread.from.email}
										</span>
										<span className="shrink-0 text-label-xs text-text-soft-400 tabular-nums">
											{dayjs(thread.receivedAt).fromNow()}
										</span>
									</div>
									<p
										className={cn(
											"truncate text-label-sm",
											thread.unread
												? "font-medium text-text-strong-950"
												: "text-text-sub-600",
										)}
									>
										{thread.subject}
									</p>
									<p className="mt-0.5 truncate text-label-xs text-text-soft-400">
										{thread.preview}
									</p>
									<div className="mt-1.5 flex flex-wrap items-center gap-1.5">
										<Badge.Root
											size="small"
											variant="lighter"
											color={status.color}
										>
											{status.label}
										</Badge.Root>
										{thread.entityTag && (
											<Badge.Root
												size="small"
												variant="lighter"
												color="gray"
											>
												{thread.entityTag}
											</Badge.Root>
										)}
										{thread.attachments && thread.attachments.length > 0 && (
											<Icon
												name="link"
												className="h-3.5 w-3.5 text-text-soft-400"
											/>
										)}
									</div>
								</div>
							</button>
						);
					})
				)}
			</div>
		</div>
	);
};
