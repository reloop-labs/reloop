import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { useMediaQuery } from "usehooks-ts";
import { useAgentInbox } from "#/features/agent-inbox/components/agent-inbox-provider";
import {
	AiSidebar,
	useAiSidebar,
} from "#/features/agent-inbox/components/ai-sidebar";
import {
	applyInboxFilters,
	InboxCommandPalette,
	useInboxActiveFilterCount,
} from "#/features/agent-inbox/components/mail-list/inbox-command-palette";
import { InboxEmptyState } from "#/features/agent-inbox/components/mail-list/inbox-empty-state";
import {
	ThreadList,
	useInboxNavigation,
} from "#/features/agent-inbox/components/mail-list/thread-list";
import { useInboxMail } from "#/features/agent-inbox/components/mail-list/use-inbox-mail";
import { LoadingDot } from "#/features/agent-inbox/components/shared/loading-dot";
import { SectionError } from "#/features/agent-inbox/components/shared/section-error";
import { useInboxSidebar } from "#/features/agent-inbox/components/sidebar/inbox-sidebar-context";
import { InboxSidebarToggle } from "#/features/agent-inbox/components/sidebar/inbox-sidebar-toggle";
import { ThreadDetail } from "#/features/agent-inbox/components/thread-detail";
import { useInboxUndo } from "#/features/agent-inbox/hooks/use-inbox-undo";
import type {
	AgentMailbox,
	BatchThreadAction,
	InboundThread,
} from "#/features/agent-inbox/types";
import {
	findThreadByListId,
	groupThreadsByConversation,
} from "#/features/agent-inbox/utils/group-threads";

const FOLDER_TITLES: Record<string, string> = {
	inbox: "All Mail",
	agent: "Agent",
	sent: "Sent",
	archive: "Archive",
	spam: "Spam",
	trash: "Trash",
	drafts: "Drafts",
	starred: "Starred",
	needs_approval: "Needs approval",
};

const isTypingTarget = (target: EventTarget | null) => {
	if (!(target instanceof HTMLElement)) return false;
	const tag = target.tagName;
	if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
	if (target.isContentEditable) return true;
	return Boolean(target.closest("[contenteditable='true'], [role='textbox']"));
};

export const AgentInboxContent = ({
	mailbox,
	folder,
	threads,
}: {
	mailbox: AgentMailbox;
	folder: string;
	threads: InboundThread[];
}) => {
	const {
		markMessageRead,
		batchThreads,
		refresh,
		isLoadingThreads,
		isLoadingMailboxes,
		getMailbox,
		threadsError,
		retryThreads,
	} = useAgentInbox();
	const mailboxReady = !!getMailbox(mailbox.id) && !!mailbox.email;
	const { toggleSidebar, openCompose } = useInboxSidebar();
	const { pushBatchUndo, undo } = useInboxUndo();
	const [mail, setMail] = useInboxMail();
	const isDesktop = useMediaQuery("(min-width: 1024px)");
	const {
		open: aiOpen,
		setOpen: setAiOpen,
		toggle: toggleAi,
	} = useAiSidebar({ defaultOpen: true });
	const listContainerRef = useRef<HTMLDivElement>(null);
	const [paletteOpen, setPaletteOpen] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const activeFilterCount = useInboxActiveFilterCount();

	useEffect(() => {
		const openSearch = () => setPaletteOpen(true);
		window.addEventListener("inbox:open-search", openSearch);
		return () => window.removeEventListener("inbox:open-search", openSearch);
	}, []);

	const [searchQuery, setSearchQuery] = useQueryState(
		"q",
		parseAsString.withDefault(""),
	);
	const [filterParam, setFilterParam] = useQueryState(
		"filter",
		parseAsString.withDefault(""),
	);
	const [selectedThreadId, setSelectedThreadId] = useQueryState(
		"threadId",
		parseAsString.withDefault(""),
	);

	const folderTitle = folder.startsWith("label:")
		? "Label"
		: (FOLDER_TITLES[folder] ?? "Inbox");

	useEffect(() => {
		setMail((prev) =>
			prev.bulkSelected.length === 0 ? prev : { ...prev, bulkSelected: [] },
		);
	}, [setMail]);

	const groupedThreads = useMemo(
		() => groupThreadsByConversation(threads),
		[threads],
	);

	const filteredThreads = useMemo(
		() => applyInboxFilters(groupedThreads, searchQuery, filterParam),
		[groupedThreads, searchQuery, filterParam],
	);

	/** Row skeleton until mailbox metadata + first thread fetch settle. */
	const listLoading =
		(isLoadingThreads || !mailboxReady || isLoadingMailboxes) &&
		filteredThreads.length === 0 &&
		!threadsError;

	const selectedThread = useMemo(() => {
		if (!selectedThreadId) return null;
		return (
			findThreadByListId(filteredThreads, selectedThreadId) ??
			findThreadByListId(groupedThreads, selectedThreadId) ??
			findThreadByListId(threads, selectedThreadId) ??
			null
		);
	}, [filteredThreads, groupedThreads, threads, selectedThreadId]);

	const handleSelectThread = useCallback(
		(id: string | null) => {
			setSelectedThreadId(id || null);
			if (!id) return;
			const thread = findThreadByListId(filteredThreads, id);
			if (thread?.unread) {
				const messageId = thread.messageId || thread.id;
				if (messageId) {
					markMessageRead(messageId, true, {
						threadId: thread.threadId ?? null,
					}).catch(() => {});
				}
			}
		},
		[setSelectedThreadId, filteredThreads, markMessageRead],
	);

	const handleCloseThread = useCallback(() => {
		setSelectedThreadId(null);
	}, [setSelectedThreadId]);

	const { focusedIndex, handleMouseEnter, resetNavigation } =
		useInboxNavigation({
			items: filteredThreads,
			containerRef: listContainerRef,
			onNavigate: handleSelectThread,
			onMarkRead: (id) => {
				const thread = findThreadByListId(filteredThreads, id);
				const messageId = thread?.messageId || thread?.id;
				if (messageId) {
					markMessageRead(messageId, true, {
						threadId: thread?.threadId ?? null,
					}).catch(() => {});
				}
			},
			isCommandPaletteOpen: paletteOpen,
		});

	const resolveBulkThreadIds = useCallback(() => {
		return mail.bulkSelected
			.map((listId) => {
				const thread = findThreadByListId(filteredThreads, listId);
				return thread?.threadId || thread?.id || listId;
			})
			.filter(Boolean);
	}, [mail.bulkSelected, filteredThreads]);

	const runBulkAction = useCallback(
		async (action: BatchThreadAction, success: string) => {
			const ids = resolveBulkThreadIds();
			if (ids.length === 0) return;
			try {
				await batchThreads(ids, action);
				pushBatchUndo(ids, action, success);
				toast.success(success);
				setMail((prev) => ({ ...prev, bulkSelected: [] }));
			} catch (err: unknown) {
				toast.error(err instanceof Error ? err.message : "Bulk action failed");
			}
		},
		[batchThreads, resolveBulkThreadIds, setMail, pushBatchUndo],
	);

	const handleRefresh = useCallback(async () => {
		setIsRefreshing(true);
		try {
			await refresh();
		} finally {
			setIsRefreshing(false);
		}
	}, [refresh]);

	const handleExitBulkSelection = useCallback(() => {
		setMail((prev) => ({ ...prev, bulkSelected: [] }));
	}, [setMail]);

	const allVisibleSelected =
		filteredThreads.length > 0 &&
		mail.bulkSelected.length === filteredThreads.length;

	const handleToggleSelectAll = useCallback(() => {
		setMail((prev) => ({
			...prev,
			bulkSelected: allVisibleSelected ? [] : filteredThreads.map((t) => t.id),
		}));
	}, [allVisibleSelected, filteredThreads, setMail]);

	const openThreadComposer = useCallback(
		(thread: InboundThread, mode: "reply" | "replyAll" | "forward") => {
			handleSelectThread(thread.id);
			const url = new URL(window.location.href);
			url.searchParams.set("threadId", thread.id);
			url.searchParams.set("compose", mode);
			window.history.replaceState({}, "", url.toString());
		},
		[handleSelectThread],
	);

	const hotkeysEnabled =
		!paletteOpen &&
		(mail.bulkSelected.length > 0 ||
			focusedIndex !== null ||
			!!selectedThreadId);

	const listHotkeysEnabled = !paletteOpen;

	useHotkeys(
		"e",
		(e) => {
			if (isTypingTarget(e.target)) return;
			if (mail.bulkSelected.length > 0) {
				void runBulkAction("archive", "Archived");
				return;
			}
			if (!selectedThread) return;
			const id = selectedThread.threadId || selectedThread.id;
			void batchThreads([id], "archive")
				.then(() => toast.success("Archived"))
				.catch((err: unknown) =>
					toast.error(err instanceof Error ? err.message : "Failed to archive"),
				);
		},
		{ enabled: hotkeysEnabled, preventDefault: true },
		[mail.bulkSelected.length, selectedThread, runBulkAction, batchThreads],
	);

	useHotkeys(
		"d",
		(e) => {
			if (isTypingTarget(e.target)) return;
			if (mail.bulkSelected.length > 0) {
				void runBulkAction("trash", "Moved to trash");
				return;
			}
			if (!selectedThread) return;
			const id = selectedThread.threadId || selectedThread.id;
			void batchThreads([id], "trash")
				.then(() => toast.success("Moved to trash"))
				.catch((err: unknown) =>
					toast.error(err instanceof Error ? err.message : "Failed to trash"),
				);
		},
		{ enabled: hotkeysEnabled, preventDefault: true },
		[mail.bulkSelected.length, selectedThread, runBulkAction, batchThreads],
	);

	useHotkeys(
		"s",
		(e) => {
			if (isTypingTarget(e.target)) return;
			if (mail.bulkSelected.length > 0) {
				void runBulkAction("star", "Starred");
			}
		},
		{
			enabled: hotkeysEnabled && mail.bulkSelected.length > 0,
			preventDefault: true,
		},
		[mail.bulkSelected.length, runBulkAction],
	);

	useHotkeys(
		"u",
		(e) => {
			if (isTypingTarget(e.target)) return;
			if (mail.bulkSelected.length > 0) {
				void runBulkAction("unread", "Marked unread");
				return;
			}
			if (!selectedThread?.messageId && !selectedThread?.id) return;
			const msgId = selectedThread.messageId ?? selectedThread.id;
			void markMessageRead(msgId, false, {
				threadId: selectedThread.threadId ?? null,
			})
				.then(() => toast.success("Marked unread"))
				.catch((err: unknown) =>
					toast.error(err instanceof Error ? err.message : "Failed"),
				);
		},
		{ enabled: hotkeysEnabled, preventDefault: true },
		[mail.bulkSelected.length, selectedThread, runBulkAction, markMessageRead],
	);

	useHotkeys(
		"mod+a",
		(e) => {
			if (isTypingTarget(e.target)) return;
			e.preventDefault();
			setMail((prev) => ({
				...prev,
				bulkSelected: filteredThreads.map((t) => t.id),
			}));
		},
		{ enabled: listHotkeysEnabled, preventDefault: true },
		[filteredThreads, setMail],
	);

	useHotkeys(
		"c",
		(e) => {
			if (isTypingTarget(e.target)) return;
			openCompose();
		},
		{ enabled: listHotkeysEnabled, preventDefault: true },
		[openCompose],
	);

	useHotkeys(
		"mod+z",
		(e) => {
			if (isTypingTarget(e.target)) return;
			void undo().then((did) => {
				if (did) toast.success("Undone");
			});
		},
		{ enabled: !paletteOpen, preventDefault: true },
		[undo, paletteOpen],
	);

	const isThreadOpen = !!selectedThreadId;

	// Escape closes bulk select first, then returns from detail → list (Gmail-style).
	useHotkeys(
		"escape",
		(e) => {
			if (isTypingTarget(e.target)) return;
			if (mail.bulkSelected.length > 0) {
				handleExitBulkSelection();
				return;
			}
			if (isThreadOpen) {
				e.preventDefault();
				handleCloseThread();
			}
		},
		{ enabled: !paletteOpen, enableOnFormTags: false },
		[
			mail.bulkSelected.length,
			isThreadOpen,
			handleExitBulkSelection,
			handleCloseThread,
			paletteOpen,
		],
	);

	const detailPane = selectedThread ? (
		<ThreadDetail
			thread={selectedThread}
			mailbox={mailbox}
			folder={folder}
			onBack={handleCloseThread}
			showBack
			onToggleAi={toggleAi}
		/>
	) : selectedThreadId && threadsError ? (
		<div className="flex h-full min-h-0 flex-col">
			<div className="flex shrink-0 items-center gap-2 px-3 pt-3 pb-2">
				<button
					type="button"
					onClick={handleCloseThread}
					className="inline-flex size-8 items-center justify-center rounded-lg text-mail-muted hover:bg-[var(--inbox-row-hover)] hover:text-mail-foreground"
					aria-label="Back to list"
				>
					<Icon name="arrow-left" className="h-4 w-4" />
				</button>
				<span className="text-mail-muted text-sm">Back</span>
			</div>
			<SectionError
				message="Couldn't load this conversation"
				onRetry={() => void retryThreads()}
				className="flex-1"
			/>
		</div>
	) : selectedThreadId && (isLoadingThreads || listLoading) ? (
		<div className="flex h-full min-h-0 flex-col items-center justify-center">
			<LoadingDot
				label="Loading conversation"
				className="text-mail-muted"
				size={28}
				dotSize={3}
			/>
		</div>
	) : selectedThreadId ? (
		<div className="flex h-full min-h-0 flex-col items-center justify-center gap-3 p-6">
			<p className="text-mail-muted text-sm">Conversation not found</p>
			<button
				type="button"
				onClick={handleCloseThread}
				className="rounded-lg bg-[var(--inbox-control)] px-3 py-1.5 text-mail-foreground text-sm hover:bg-[var(--inbox-control-hover)]"
			>
				Back to list
			</button>
		</div>
	) : null;

	const listPane = (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="sticky top-0 z-15 shrink-0 bg-panel-light dark:bg-panel-dark">
				<div className="flex items-center py-3.5 pr-6 pl-4">
					<InboxSidebarToggle onClick={toggleSidebar} />
					<span className="ml-1 w-2 shrink-0" aria-hidden="true" />
					<h1 className="min-w-0 truncate font-semibold text-[18px] text-mail-foreground">
						{folderTitle}
					</h1>
					{mail.bulkSelected.length === 0 ? (
						<div className="ml-auto flex items-center gap-1 text-mail-muted">
							{activeFilterCount > 0 && (
								<span className="mr-1 rounded-full bg-zero-blue/15 px-1.5 py-0.5 font-medium text-[11px] text-zero-blue tabular-nums">
									{activeFilterCount}
								</span>
							)}
							<button
								type="button"
								onClick={() => setPaletteOpen(true)}
								title="Filter"
								aria-label="Filter"
								className="inline-flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--inbox-row-hover)]"
							>
								<Icon name="filter" className="h-4 w-4 text-mail-muted" />
							</button>
							<button
								type="button"
								onClick={() => setPaletteOpen(true)}
								title="Search"
								aria-label="Search"
								className="inline-flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--inbox-row-hover)]"
							>
								<Icon name="search" className="h-4 w-4 text-mail-muted" />
							</button>
							<button
								type="button"
								onClick={handleRefresh}
								disabled={isRefreshing}
								title="Refresh"
								aria-label="Refresh"
								className="inline-flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--inbox-row-hover)] disabled:opacity-50"
							>
								{isRefreshing ? (
									<LoadingDot
										label="Refreshing"
										className="text-mail-muted"
										style={{ fontSize: 12 }}
									/>
								) : (
									<Icon name="refresh-cw" className="h-4 w-4 text-mail-muted" />
								)}
							</button>
							<button
								type="button"
								onClick={toggleAi}
								title="Agent chat"
								aria-label="Agent chat"
								className={cn(
									"inline-flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-[var(--inbox-row-hover)]",
									aiOpen && "bg-[var(--inbox-selected)]",
								)}
							>
								<Icon name="agent" className="h-4 w-4 text-mail-muted" />
							</button>
						</div>
					) : (
						<div className="ml-auto flex items-center gap-1">
							<button
								type="button"
								title="Archive"
								onClick={() => void runBulkAction("archive", "Archived")}
								className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--inbox-control)] hover:bg-[var(--inbox-control-hover)]"
							>
								<Icon name="archive" className="h-3.5 w-3.5 text-mail-muted" />
							</button>
							<button
								type="button"
								title="Trash"
								onClick={() => void runBulkAction("trash", "Moved to trash")}
								className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--inbox-control)] hover:bg-[var(--inbox-control-hover)]"
							>
								<Icon name="trash" className="h-3.5 w-3.5 text-mail-muted" />
							</button>
							<button
								type="button"
								title="Spam"
								onClick={() => void runBulkAction("spam", "Moved to spam")}
								className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--inbox-control)] hover:bg-[var(--inbox-control-hover)]"
							>
								<Icon name="alert" className="h-3.5 w-3.5 text-mail-muted" />
							</button>
							<button
								type="button"
								title="Star"
								onClick={() => void runBulkAction("star", "Starred")}
								className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--inbox-control)] hover:bg-[var(--inbox-control-hover)]"
							>
								<Icon name="star" className="h-3.5 w-3.5 text-mail-muted" />
							</button>
							<button
								type="button"
								title="Pin"
								onClick={() => void runBulkAction("pin", "Pinned")}
								className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--inbox-control)] hover:bg-[var(--inbox-control-hover)]"
							>
								<Icon name="pin" className="h-3.5 w-3.5 text-mail-muted" />
							</button>
							<button
								type="button"
								title="Mark read"
								onClick={() => void runBulkAction("read", "Marked as read")}
								className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--inbox-control)] hover:bg-[var(--inbox-control-hover)]"
							>
								<Icon name="mail" className="h-3.5 w-3.5 text-mail-muted" />
							</button>
							<button
								type="button"
								onClick={handleToggleSelectAll}
								title={allVisibleSelected ? "Deselect all" : "Select all"}
								className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[var(--inbox-control)] px-2 text-mail-muted text-xs hover:bg-[var(--inbox-control-hover)]"
							>
								<span className="font-medium text-mail-foreground tabular-nums">
									{mail.bulkSelected.length}
								</span>
								selected
							</button>
							<button
								type="button"
								onClick={handleExitBulkSelection}
								className="inline-flex h-8 items-center gap-2 rounded-lg bg-mail-accent px-2 text-xs"
							>
								<Icon name="cross" className="h-3 w-3" />
								<span>ESC</span>
							</button>
						</div>
					)}
				</div>
			</div>

			<div
				ref={listContainerRef}
				className="relative z-1 flex min-h-0 flex-1 flex-col overflow-hidden"
			>
				{threadsError && filteredThreads.length === 0 ? (
					<SectionError
						message="Couldn't load messages"
						onRetry={() => void retryThreads()}
						className="flex-1"
					/>
				) : filteredThreads.length === 0 && !listLoading && !threadsError ? (
					<div className="flex min-h-0 flex-1 items-center justify-center p-6">
						<InboxEmptyState onCompose={openCompose} onOpenAi={toggleAi} />
					</div>
				) : (
					<ThreadList
						threads={filteredThreads}
						mailboxId={mailbox.id}
						folder={folder}
						selectedId={selectedThreadId}
						onSelect={handleSelectThread}
						isLoading={listLoading}
						hasFilters={searchQuery !== "" || activeFilterCount > 0}
						onClearFilters={() => {
							setSearchQuery(null);
							setFilterParam(null);
							resetNavigation();
						}}
						focusedIndex={focusedIndex}
						onMouseEnterRow={handleMouseEnter}
						searchQuery={searchQuery}
						onReply={(t) => openThreadComposer(t, "reply")}
						onReplyAll={(t) => openThreadComposer(t, "replyAll")}
						onForward={(t) => openThreadComposer(t, "forward")}
					/>
				)}
			</div>
		</div>
	);

	return (
		<>
			<InboxCommandPalette
				open={paletteOpen}
				onOpenChange={setPaletteOpen}
				threads={groupedThreads}
				onSelectThread={handleSelectThread}
			/>
			{/* Gmail-style: list OR detail fills the main pane (not side-by-side). */}
			<div className="relative flex min-h-0 min-w-0 flex-1 gap-1 rounded-inherit p-0 lg:h-[calc(100dvh-8px)]">
				<div className="mb-1 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-panel-light md:rounded-2xl lg:h-[calc(100dvh-8px)] dark:bg-panel-dark">
					{isThreadOpen ? detailPane : listPane}
				</div>

				{isDesktop && aiOpen && (
					<AiSidebar
						open={aiOpen}
						onClose={() => setAiOpen(false)}
						thread={selectedThread}
					/>
				)}
			</div>
		</>
	);
};
