"use client";

import * as Checkbox from "@reloop/ui/checkbox";
import { InboxListEmptyState } from "./inbox-empty-state";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { VList, type VListHandle } from "virtua";
import type { InboundThread } from "../types";
import { useAgentInbox } from "./agent-inbox-provider";
import { InboxThreadRow } from "./inbox-thread-row";
import { useInboxMail } from "./use-inbox-mail";
import { useInboxNavigation } from "./use-inbox-navigation";

const PAGE_SIZE = 30;

interface ThreadListProps {
	threads: InboundThread[];
	selectedId: string | null;
	onSelect: (id: string) => void;
	emptyMessage?: string;
	hasFilters?: boolean;
	onClearFilters?: () => void;
	focusedIndex?: number | null;
	onMouseEnterRow?: (id: string) => void;
}

export const ThreadList = ({
	threads,
	selectedId,
	onSelect,
	emptyMessage = "No messages in this filter",
	hasFilters = false,
	onClearFilters,
	focusedIndex = null,
	onMouseEnterRow,
}: ThreadListProps) => {
	const {
		deleteMessage,
		toggleMessageStar,
		archiveThread,
	} = useAgentInbox();
	const [mail, setMail] = useInboxMail();
	const vListRef = useRef<VListHandle>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

	const visibleThreads = useMemo(
		() => threads.slice(0, visibleCount),
		[threads, visibleCount],
	);

	const handleToggleBulk = useCallback(
		(id: string) => {
			setMail((prev) => {
				const isSelected = prev.bulkSelected.includes(id);
				return {
					...prev,
					bulkSelected: isSelected
						? prev.bulkSelected.filter((x) => x !== id)
						: [...prev.bulkSelected, id],
				};
			});
		},
		[setMail],
	);

	const handleToggleStar = async (id: string, starred: boolean) => {
		try {
			await toggleMessageStar(id, starred);
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : "Failed to update star");
		}
	};

	const handleArchive = async (listId: string) => {
		const thread = threads.find((t) => t.id === listId);
		const archiveId = thread?.threadId || listId;
		try {
			await archiveThread(archiveId);
			toast.success("Archived");
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : "Failed to archive");
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this message?")) return;
		try {
			await deleteMessage(id);
			toast.success("Message deleted");
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : "Failed to delete");
		}
	};

	const handleSelectAll = () => {
		if (mail.bulkSelected.length === visibleThreads.length) {
			setMail((prev) => ({ ...prev, bulkSelected: [] }));
		} else {
			setMail((prev) => ({
				...prev,
				bulkSelected: visibleThreads.map((t) => t.id),
			}));
		}
	};

	const handleLoadMore = useCallback(() => {
		if (visibleCount < threads.length) {
			setVisibleCount((c) => Math.min(c + PAGE_SIZE, threads.length));
		}
	}, [visibleCount, threads.length]);

	let foundFirstToday = false;

	if (threads.length === 0) {
		return (
			<InboxListEmptyState
				hasFilters={hasFilters}
				onClearFilters={onClearFilters}
			/>
		);
	}

	return (
		<div ref={containerRef} className="flex h-full min-h-0 flex-1 flex-col">
			{mail.bulkSelected.length > 0 ? (
				<div className="flex items-center justify-between border-mail-border border-b px-4 py-2 border-mail-border">
					<div className="flex items-center gap-2">
						<Checkbox.Root
							checked={mail.bulkSelected.length === visibleThreads.length}
							onCheckedChange={handleSelectAll}
						/>
						<span className="font-medium text-sm text-mail-foreground text-mail-foreground">
							{mail.bulkSelected.length} selected
						</span>
					</div>
					<button
						type="button"
						onClick={() => setMail((prev) => ({ ...prev, bulkSelected: [] }))}
						className="font-medium text-mail-foreground text-xs hover:underline"
					>
						Clear
					</button>
				</div>
			) : null}

			<div
				className="relative min-h-0 flex-1 overflow-hidden"
				id="mail-list-scroll"
			>
				<VList
					ref={vListRef}
					count={visibleThreads.length}
					overscan={5}
					itemSize={100}
					className="absolute inset-0 overflow-x-hidden scrollbar-hide"
					onScroll={() => {
						const handle = vListRef.current;
						if (!handle) return;
						const end = handle.findEndIndex();
						if (end >= visibleThreads.length - 5) {
							handleLoadMore();
						}
					}}
				>
					{(index) => {
						const thread = visibleThreads[index];
						if (!thread) return <div key={index} />;

						const dateObj = new Date(thread.receivedAt);
						const isToday = dateObj.toDateString() === new Date().toDateString();
						let isFirstToday = false;
						if (isToday && !foundFirstToday) {
							isFirstToday = true;
							foundFirstToday = true;
						}

						return (
							<InboxThreadRow
								key={thread.id}
								thread={thread}
								index={index}
								isSelected={selectedId === thread.id}
								isKeyboardFocused={focusedIndex === index}
								isBulkSelected={mail.bulkSelected.includes(thread.id)}
								isFirstToday={isFirstToday}
								onSelect={onSelect}
								onMouseEnter={onMouseEnterRow ?? (() => {})}
								onToggleStar={handleToggleStar}
								onArchive={handleArchive}
								onDelete={handleDelete}
								onToggleBulk={handleToggleBulk}
							/>
						);
					}}
				</VList>
			</div>
		</div>
	);
};

export { useInboxNavigation };
