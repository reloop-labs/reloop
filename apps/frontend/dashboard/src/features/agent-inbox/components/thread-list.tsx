import * as Checkbox from "@reloop/ui/checkbox";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { VList, type VListHandle } from "virtua";
import type { InboundThread } from "../types";
import { splitPinnedThreads } from "../utils/group-threads";
import { useAgentInbox } from "./agent-inbox-provider";
import { InboxListEmptyState } from "./inbox-empty-state";
import { InboxThreadRow } from "./inbox-thread-row";
import { MailListSpinner } from "./mail-skeleton";
import { ThreadContextMenu } from "./thread-context-menu";
import { useInboxMail } from "./use-inbox-mail";
import { useInboxNavigation } from "./use-inbox-navigation";

const PAGE_SIZE = 30;
const SECTION_HEADER_SIZE = 32;
const THREAD_ROW_SIZE = 72;

type ListItem =
	| { type: "header"; key: string; label: string; count: number }
	| { type: "thread"; key: string; thread: InboundThread; flatIndex: number };

interface ThreadListProps {
	threads: InboundThread[];
	mailboxId: string;
	folder?: string;
	sectionLabel?: string;
	selectedId: string | null;
	onSelect: (id: string) => void;
	emptyMessage?: string;
	hasFilters?: boolean;
	onClearFilters?: () => void;
	focusedIndex?: number | null;
	onMouseEnterRow?: (id: string) => void;
	searchQuery?: string;
	onReply?: (thread: InboundThread) => void;
	onReplyAll?: (thread: InboundThread) => void;
	onForward?: (thread: InboundThread) => void;
	isLoading?: boolean;
}

export const ThreadList = ({
	threads,
	mailboxId,
	folder,
	sectionLabel = "Primary",
	selectedId,
	onSelect,
	emptyMessage = "No messages in this filter",
	hasFilters = false,
	onClearFilters,
	focusedIndex = null,
	onMouseEnterRow,
	searchQuery,
	onReply,
	onReplyAll,
	onForward,
	isLoading = false,
}: ThreadListProps) => {
	const { toggleMessageStar, archiveThread, trashThread } = useAgentInbox();
	const [mail, setMail] = useInboxMail();
	const vListRef = useRef<VListHandle>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
	const lastBulkIndexRef = useRef<number | null>(null);

	const { pinned, rest } = useMemo(
		() => splitPinnedThreads(threads),
		[threads],
	);

	const orderedThreads = useMemo(() => [...pinned, ...rest], [pinned, rest]);

	const visibleThreads = useMemo(
		() => orderedThreads.slice(0, visibleCount),
		[orderedThreads, visibleCount],
	);

	const listItems = useMemo(() => {
		const items: ListItem[] = [];
		const visiblePinned = visibleThreads.filter((t) => t.isPinned);
		const visibleRest = visibleThreads.filter((t) => !t.isPinned);
		let flatIndex = 0;

		if (pinned.length > 0 && visiblePinned.length > 0) {
			items.push({
				type: "header",
				key: "header-pinned",
				label: "Pinned",
				count: pinned.length,
			});
			for (const thread of visiblePinned) {
				items.push({
					type: "thread",
					key: thread.id,
					thread,
					flatIndex: flatIndex++,
				});
			}
		}

		if (visibleRest.length > 0 || (pinned.length === 0 && rest.length > 0)) {
			items.push({
				type: "header",
				key: `header-${sectionLabel}`,
				label: sectionLabel,
				count: rest.length,
			});
			for (const thread of visibleRest) {
				items.push({
					type: "thread",
					key: thread.id,
					thread,
					flatIndex: flatIndex++,
				});
			}
		}

		return items;
	}, [visibleThreads, pinned.length, rest.length, sectionLabel]);

	const handleToggleBulk = useCallback(
		(id: string, event?: React.MouseEvent) => {
			const index = visibleThreads.findIndex((t) => t.id === id);

			if (event?.shiftKey && lastBulkIndexRef.current !== null && index >= 0) {
				const start = Math.min(lastBulkIndexRef.current, index);
				const end = Math.max(lastBulkIndexRef.current, index);
				const rangeIds = visibleThreads.slice(start, end + 1).map((t) => t.id);
				setMail((prev) => ({
					...prev,
					bulkSelected: Array.from(
						new Set([...prev.bulkSelected, ...rangeIds]),
					),
				}));
				return;
			}

			if (index >= 0) lastBulkIndexRef.current = index;

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
		[setMail, visibleThreads],
	);

	const handleRowSelect = useCallback(
		(id: string, event?: React.MouseEvent) => {
			if (event?.shiftKey && mail.bulkSelected.length > 0) {
				handleToggleBulk(id, event);
				return;
			}
			onSelect(id);
		},
		[handleToggleBulk, mail.bulkSelected.length, onSelect],
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

	const handleDelete = async (listId: string) => {
		const thread = threads.find((t) => t.id === listId);
		const trashId = thread?.threadId || listId;
		if (!confirm("Move this thread to trash?")) return;
		try {
			await trashThread(trashId);
			toast.success("Moved to trash");
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : "Failed to trash");
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
		if (visibleCount < orderedThreads.length) {
			setVisibleCount((c) => Math.min(c + PAGE_SIZE, orderedThreads.length));
		}
	}, [visibleCount, orderedThreads.length]);

	let foundFirstToday = false;

	if (isLoading && threads.length === 0) {
		return <MailListSpinner />;
	}

	if (threads.length === 0) {
		return (
			<div className="flex h-full min-h-0 w-full flex-1 items-center justify-center">
				<InboxListEmptyState
					hasFilters={hasFilters}
					onClearFilters={onClearFilters}
				/>
			</div>
		);
	}

	return (
		<div ref={containerRef} className="flex h-full min-h-0 flex-1 flex-col">
			{mail.bulkSelected.length > 0 ? (
				<div className="flex items-center justify-between border-mail-border border-b px-4 py-2">
					<div className="flex items-center gap-2">
						<Checkbox.Root
							checked={mail.bulkSelected.length === visibleThreads.length}
							onCheckedChange={handleSelectAll}
						/>
						<span className="font-medium text-mail-foreground text-sm">
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
					count={listItems.length}
					overscan={5}
					itemSize={THREAD_ROW_SIZE}
					className="scrollbar-hide absolute inset-0 overflow-x-hidden"
					onScroll={() => {
						const handle = vListRef.current;
						if (!handle) return;
						const end = handle.findEndIndex();
						if (end >= listItems.length - 5) {
							handleLoadMore();
						}
					}}
				>
					{(index) => {
						const item = listItems[index];
						if (!item) return <div key={index} />;

						if (item.type === "header") {
							return (
								<div
									key={item.key}
									className="flex h-8 items-center px-5 pt-1"
									style={{ height: SECTION_HEADER_SIZE }}
								>
									<span className="font-medium text-[11px] text-mail-muted tracking-wide">
										{item.label}{" "}
										<span className="text-mail-muted/70">[{item.count}]</span>
									</span>
								</div>
							);
						}

						const { thread, flatIndex } = item;
						const dateObj = new Date(thread.receivedAt);
						const isToday =
							dateObj.toDateString() === new Date().toDateString();
						let isFirstToday = false;
						if (isToday && !foundFirstToday) {
							isFirstToday = true;
							foundFirstToday = true;
						}

						return (
							<ThreadContextMenu
								key={thread.id}
								thread={thread}
								mailboxId={mailboxId}
								folder={folder}
								onOpenThread={onSelect}
								onReply={onReply}
								onReplyAll={onReplyAll}
								onForward={onForward}
							>
								<InboxThreadRow
									thread={thread}
									index={flatIndex}
									isSelected={selectedId === thread.id}
									isKeyboardFocused={focusedIndex === flatIndex}
									isBulkSelected={mail.bulkSelected.includes(thread.id)}
									isFirstToday={isFirstToday}
									searchQuery={searchQuery}
									onSelect={handleRowSelect}
									onMouseEnter={onMouseEnterRow ?? (() => {})}
									onToggleStar={handleToggleStar}
									onArchive={handleArchive}
									onDelete={handleDelete}
									onToggleBulk={handleToggleBulk}
								/>
							</ThreadContextMenu>
						);
					}}
				</VList>
			</div>
		</div>
	);
};

export { useInboxNavigation };
